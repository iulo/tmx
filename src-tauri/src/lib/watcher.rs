//! Filesystem watcher.

use std::collections::HashSet;
use std::io;
use std::path::PathBuf;
use std::sync::Weak;
use std::time::Duration;

use fsevent_stream::ffi::{kFSEventStreamCreateFlagIgnoreSelf, kFSEventStreamEventIdSinceNow};
use fsevent_stream::stream::{create_event_stream, EventStreamHandler};
use futures::StreamExt;
use tracing::{debug, error};

use crate::mission::Mission;
use crate::skip_cache::SkipCache;
use crate::tmutil::ExclusionActionBatch;
use crate::walker::walk_non_recursive;

const EVENT_DELAY: Duration = Duration::from_secs(30);

struct DropGuard(Option<EventStreamHandler>);

impl DropGuard {
    pub const fn new(handler: EventStreamHandler) -> Self {
        Self(Some(handler))
    }
}

impl Drop for DropGuard {
    fn drop(&mut self) {
        if let Some(mut handler) = self.0.take() {
            handler.abort();
        }
    }
}

fn prepare_event_paths(
    paths: impl IntoIterator<Item = PathBuf>,
    skips: &HashSet<PathBuf>,
) -> Vec<PathBuf> {
    let mut seen = HashSet::new();
    paths
        .into_iter()
        .filter(|path| !path.as_os_str().is_empty())
        .filter(|path| !skips.iter().any(|skip| path.starts_with(skip)))
        .filter(|path| seen.insert(path.clone()))
        .collect()
}

#[cfg(test)]
mod tests {
    use std::collections::HashSet;
    use std::path::PathBuf;

    use super::prepare_event_paths;

    #[test]
    fn event_paths_are_deduplicated_and_skipped_before_scanning() {
        let paths = (0..10_000)
            .flat_map(|_| {
                [
                    PathBuf::from("/project/src"),
                    PathBuf::from("/project/node_modules/pkg"),
                    PathBuf::from("/project/tests"),
                ]
            })
            .chain([PathBuf::new()]);
        let skips = HashSet::from([PathBuf::from("/project/node_modules")]);

        let mut actual = prepare_event_paths(paths, &skips);
        actual.sort();

        assert_eq!(
            actual,
            [PathBuf::from("/project/src"), PathBuf::from("/project/tests")]
        );
    }
}

/// # Errors
/// Returns `io::Error` if fs event stream creation fails.
pub async fn watch_task(mission: Weak<Mission>) -> io::Result<()> {
    let mission = mission.upgrade().ok_or_else(|| {
        io::Error::new(
            io::ErrorKind::Other,
            "mission is dropped before watch task is started",
        )
    })?;
    let config = mission.config_();
    let metrics = mission.metrics();

    let paths = config
        .walk
        .directories
        .iter()
        .map(|directory| directory.path.as_path());
    let no_include = config.no_include;
    let support_dump = config.support_dump;

    let (mut stream, event_handle) = create_event_stream(
        paths,
        kFSEventStreamEventIdSinceNow,
        EVENT_DELAY,
        kFSEventStreamCreateFlagIgnoreSelf,
    )?;
    let _guard = DropGuard::new(event_handle);

    let cache = SkipCache::default();
    while let Some(items) = stream.next().await {
        let paths = prepare_event_paths(
            items.into_iter().map(|item| item.path),
            &config.walk.skips,
        );
        if paths.is_empty() {
            continue;
        }

        let walk_config = config.walk.clone();
        let cache = cache.clone();
        let metrics = metrics.clone();
        let result = tauri::async_runtime::spawn_blocking(move || {
            let mut batch = ExclusionActionBatch::default();
            for path in paths {
                batch += walk_non_recursive(&path, &walk_config, support_dump, &cache);
            }

            batch.add.sort_unstable();
            batch.add.dedup();
            batch.remove.sort_unstable();
            batch.remove.dedup();
            if no_include {
                batch.remove.clear();
            }
            if batch.is_empty() {
                return;
            }

            debug!("Apply batch {:?}", batch);
            metrics.inc_excluded(batch.add.len());
            metrics.inc_included(batch.remove.len());
            if let Some(last_file) = batch.add.last() {
                metrics.set_last_excluded(last_file.as_path());
            }
            if let Err(errors) = batch.apply(support_dump) {
                for (path, e) in errors {
                    error!("Error when applying on file {}: {}", path.display(), e);
                }
            }
        })
        .await;
        if let Err(error) = result {
            error!("Filesystem watcher worker failed: {}", error);
        }
    }

    Ok(())
}
