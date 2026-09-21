#![allow(clippy::module_name_repetitions, clippy::needless_pass_by_value)]
#![allow(unexpected_cfgs)]
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[macro_use]
extern crate objc;

use std::sync::Arc;

use once_cell::sync::Lazy;
use regex::Regex;
use tap::TapFallible;
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    ActivationPolicy, Manager,
};
use tracing::{error, instrument};
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

use tmx_lib::{
    ApplyErrors, ConfigManager, ExclusionActionBatch, Metrics, Mission, PreConfig, ScanStatus,
    Store,
};

use crate::metadata::build_meta;

mod metadata;
mod plugins;

#[tauri::command]
#[instrument(skip(mission))]
fn metrics(mission: tauri::State<Arc<Mission>>) -> Arc<Metrics> {
    mission.metrics()
}

#[tauri::command]
#[instrument(skip(mission))]
fn get_config(mission: tauri::State<Arc<Mission>>) -> Arc<PreConfig> {
    mission.config()
}

#[tauri::command]
#[instrument(skip_all)]
fn set_config(mission: tauri::State<Arc<Mission>>, config: PreConfig) -> Result<(), String> {
    let mission = mission.inner().clone();
    mission.set_config(config).map_err(|e| e.to_string())
}

#[tauri::command]
#[instrument(skip(mission))]
fn scan_status(mission: tauri::State<Arc<Mission>>) -> ScanStatus {
    mission.scan_status()
}

#[tauri::command]
#[instrument(skip(mission))]
fn start_full_scan(mission: tauri::State<Arc<Mission>>) {
    mission.inner().clone().full_scan()
}

#[tauri::command]
#[instrument(skip(mission))]
fn stop_full_scan(mission: tauri::State<Arc<Mission>>) {
    mission.stop_full_scan();
}

#[tauri::command]
#[instrument(skip_all, fields(add = batch.add.len(), remove = batch.remove.len()))]
async fn apply_action_batch(
    mission: tauri::State<'_, Arc<Mission>>,
    batch: ExclusionActionBatch,
) -> Result<(), ApplyErrors> {
    let support_dump = mission.inner().config().support_dump;
    tauri::async_runtime::spawn_blocking(move || {
        let r = batch
            .apply(support_dump)
            .tap_err(|e| e.values().for_each(|e| error!(?e, "Apply batch failed")));
        ApplyErrors::from(r)
    })
    .await
    .expect("spawn_blocking failed")
}

#[tauri::command]
#[instrument(skip(mission))]
fn store_get(mission: tauri::State<Arc<Mission>>, key: &str) -> Option<serde_json::Value> {
    mission.store_get(key)
}

#[tauri::command]
#[instrument(skip(mission))]
fn store_set(mission: tauri::State<Arc<Mission>>, key: String, value: serde_json::Value) {
    mission.store_set(key, value)
}

#[tauri::command]
#[instrument(skip(mission))]
fn store_del(mission: tauri::State<Arc<Mission>>, key: &str) {
    mission.store_del(key)
}

fn system_tray(app: &tauri::App) -> tauri::Result<()> {
    let preference = MenuItem::with_id(app, "preference", "Main Window", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let tray_menu = Menu::with_items(
        app,
        &[&preference, &PredefinedMenuItem::separator(app)?, &quit],
    )?;
    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .icon_as_template(true)
        .menu(&tray_menu)
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                if let Some(window) = tray.app_handle().get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .on_menu_event(|app, event| match event.id.as_ref() {
            "preference" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .build(app)?;
    Ok(())
}

fn main() {
    static PATH_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r#""/.*""#).unwrap());
    let _guard = sentry::init((
        option_env!("SENTRY_DSN").unwrap_or(""),
        sentry::ClientOptions {
            release: Some(build_meta().version.into()),
            before_send: Some(Arc::new(|mut ev| {
                ev.message = ev
                    .message
                    .map(|s| PATH_RE.replace_all(&s, "\"<SENSITIVE>\"").to_string());
                Some(ev)
            })),
            before_breadcrumb: Some(Arc::new(|mut breadcrumb| {
                breadcrumb.message = breadcrumb
                    .message
                    .map(|s| PATH_RE.replace_all(&s, "\"<SENSITIVE>\"").to_string());
                Some(breadcrumb)
            })),
            ..Default::default()
        },
    ));
    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .with(sentry::integrations::tracing::layer())
        .init();

    let context = tauri::generate_context!();

    let config_manager = ConfigManager::new().unwrap();
    tauri::Builder::default()
        .plugin(plugins::background())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .invoke_handler(tauri::generate_handler![
            metrics,
            get_config,
            set_config,
            scan_status,
            start_full_scan,
            stop_full_scan,
            apply_action_batch,
            build_meta,
            store_get,
            store_set,
            store_del
        ])
        .setup(move |app| {
            plugins::hide_on_close(app);
            system_tray(app)?;
            let config_dir = app.path().app_config_dir()?;
            let legacy_dir = config_dir.with_file_name("me.lightquantum.tmexclude");
            let legacy_store = legacy_dir.join(".properties");
            if !config_dir.join(".properties").exists() && legacy_store.exists() {
                std::fs::create_dir_all(&config_dir)?;
                std::fs::copy(legacy_store, config_dir.join(".properties"))?;
            }
            let store = Store::new(&config_dir);
            app.manage(
                Mission::new_arc(app.handle().clone(), config_manager, store)
                    .expect("failed to create mission"),
            );
            app.set_activation_policy(ActivationPolicy::Accessory);
            Ok(())
        })
        .run(context)
        .expect("error while running tauri application");
}
