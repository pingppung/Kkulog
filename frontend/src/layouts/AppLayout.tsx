import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { syncSettingsWindow } from "./settingsWindow";
import { fontOptions, useSettingsStore } from "../store/setting";
import type { CSSProperties } from "react";

export default function AppLayout() {
  const { pathname } = useLocation();
  const inSettings = pathname === "/settings" || pathname.startsWith("/settings/");
  useEffect(() => { void syncSettingsWindow(inSettings); }, [inSettings]);
  const colors = useSettingsStore(s => s.preview ?? s.colors);
  const transparency = useSettingsStore(s => s.previewTransparency ?? s.transparency);
  const font = useSettingsStore(s => s.previewFont ?? s.font);
  useEffect(() => {
    document.documentElement.style.setProperty("--app-font", fontOptions.find(option => option.value === font)!.family);
    return () => { document.documentElement.style.removeProperty("--app-font"); };
  }, [font]);
  const style = {
    ...Object.fromEntries(Object.entries(colors).map(([key, value]) => [`--color-${key}`, value])),
    "--calendar-surface-opacity": `${100 - transparency}%`,
  } as CSSProperties;

  return (
    <div style={style} className="app-layout w-full h-full">
      <Outlet />
    </div>
  );
}
