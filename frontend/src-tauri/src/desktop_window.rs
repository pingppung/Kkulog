//! Keep the widget below ordinary windows even when Windows activates it.
//! Install on the window's UI thread; no timer or background polling is needed.
use windows::Win32::{
    Foundation::{HWND, LPARAM, LRESULT, WPARAM},
    UI::{
        Shell::{DefSubclassProc, RemoveWindowSubclass, SetWindowSubclass},
        WindowsAndMessaging::{
            SetWindowPos, HWND_BOTTOM, SWP_NOACTIVATE, SWP_NOMOVE, SWP_NOSIZE,
            SWP_NOZORDER, WINDOWPOS, WM_NCDESTROY, WM_WINDOWPOSCHANGING,
        },
    },
};

const SUBCLASS_ID: usize = 0x4B4B554C;

unsafe extern "system" fn keep_below_windows(
    hwnd: HWND,
    message: u32,
    wparam: WPARAM,
    lparam: LPARAM,
    subclass_id: usize,
    _data: usize,
) -> LRESULT {
    if message == WM_WINDOWPOSCHANGING && lparam.0 != 0 {
        // Windows owns this WINDOWPOS for the duration of this message. Change
        // the proposed Z order before it is applied, rather than lowering the
        // window after a focus event (which can briefly cover other apps).
        let position = &mut *(lparam.0 as *mut WINDOWPOS);
        if (position.flags & SWP_NOZORDER).0 == 0 {
            position.hwndInsertAfter = HWND_BOTTOM;
        }
    } else if message == WM_NCDESTROY {
        // Do not leave our callback installed after the HWND is destroyed.
        let _ = RemoveWindowSubclass(hwnd, Some(keep_below_windows), subclass_id);
    }
    // Preserve Tauri/WebView handling, including input, dragging and resizing.
    DefSubclassProc(hwnd, message, wparam, lparam)
}

pub fn install(window: &tauri::WebviewWindow) -> Result<(), Box<dyn std::error::Error>> {
    // Tauri and this module can use different windows crate versions. Convert
    // the shared native handle instead of passing their wrapper types across.
    let hwnd = HWND(window.hwnd()?.0);
    unsafe {
        if !SetWindowSubclass(hwnd, Some(keep_below_windows), SUBCLASS_ID, 0).as_bool() {
            return Err("위젯의 창 순서 고정을 설정하지 못했습니다.".into());
        }
        SetWindowPos(hwnd, HWND_BOTTOM, 0, 0, 0, 0,
            SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE)?;
    }
    Ok(())
}
