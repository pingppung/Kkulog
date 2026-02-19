use tauri::Manager;

#[tauri::command]
fn set_edit_mode(window: tauri::Window, is_edit: bool) {
    // 여기서 window는 이미 tauri::Window 타입으로 명시되어 있어 에러가 안 납니다.
    let _ = window.set_resizable(is_edit);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // 🎯 핵심: 타입을 tauri::WebviewWindow로 확실히 지정합니다.
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_resizable(false);
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![set_edit_mode])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}