import { isTauri } from "@tauri-apps/api/core";
import { currentMonitor, getCurrentWindow, LogicalSize, PhysicalPosition } from "@tauri-apps/api/window";
import type { PhysicalSize } from "@tauri-apps/api/window";

let original: { size: PhysicalSize; position: PhysicalPosition; resizable: boolean } | null = null;
let transition: Promise<void> = Promise.resolve();

// Serialize transitions so a quick back navigation cannot overtake expansion.
export function syncSettingsWindow(inSettings: boolean): Promise<void> {
  if (!isTauri()) return Promise.resolve();
  transition = transition.then(async () => {
    const window = getCurrentWindow();
    if (inSettings) {
      if (original) return;
      const [size, position, scale, monitor, resizable] = await Promise.all([
        window.innerSize(), window.outerPosition(), window.scaleFactor(), currentMonitor(), window.isResizable(),
      ]);
      original = { size, position, resizable };
      await window.setSizeConstraints({ minWidth: 400, minHeight: 350 });
      const work = monitor?.workArea;
      const width = Math.max(400, Math.min(Math.max(1100, size.width / scale), work ? work.size.width / scale : 1100));
      const height = Math.max(350, Math.min(Math.max(760, size.height / scale), work ? work.size.height / scale : 760));
      await window.setSize(new LogicalSize(width, height));
      if (work) {
        const x = Math.max(work.position.x, Math.min(position.x, work.position.x + work.size.width - Math.round(width * scale)));
        const y = Math.max(work.position.y, Math.min(position.y, work.position.y + work.size.height - Math.round(height * scale)));
        await window.setPosition(new PhysicalPosition(x, y));
      }
      await window.setResizable(false);
    } else if (original) {
      const saved = original;
      await window.setSizeConstraints({ minWidth: 400, minHeight: 350, maxWidth: 800 });
      await window.setSize(saved.size);
      await window.setPosition(saved.position);
      await window.setResizable(saved.resizable);
      original = null;
    }
  }).catch(error => {
    console.error("설정 창 크기를 변경하지 못했습니다.", error);
  });
  return transition;
}
