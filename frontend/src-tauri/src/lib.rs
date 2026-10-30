mod database;
#[cfg(target_os = "windows")]
mod desktop_window;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let path = app.path().app_data_dir();
            let task = tauri::async_runtime::spawn_blocking(move || match path {
                Ok(path) => database::Database::open(&path.join("kkulog.sqlite3")),
                Err(error) => database::Database(Err(error.to_string())),
            });
            let database = tauri::async_runtime::block_on(task)
                .unwrap_or_else(|error| database::Database(Err(error.to_string())));
            app.manage(database);
            if let Some(window) = app.get_webview_window("main") {
                window.set_resizable(true)?;
                #[cfg(target_os = "windows")]
                desktop_window::install(&window)?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            database::fetch_events,
            database::create_event,
            database::update_event,
            database::delete_event
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
