//! Keep application windows alive when closed and hide them in the background.

use tauri::{Manager, Runtime, WindowEvent};

pub fn background<R: Runtime>() -> tauri::plugin::TauriPlugin<R> {
    tauri::plugin::Builder::new("background")
        .on_event(|app, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                api.prevent_exit();
            }
            let _ = app;
        })
        .build()
}

pub fn hide_on_close<R: Runtime>(app: &tauri::App<R>) {
    for label in ["main", "about", "ack", "license"] {
        if let Some(window) = app.get_webview_window(label) {
            let hidden = window.clone();
            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    let _ = hidden.hide();
                    api.prevent_close();
                }
            });
        }
    }
}
