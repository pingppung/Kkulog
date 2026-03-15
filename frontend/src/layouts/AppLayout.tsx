import { Outlet } from "react-router-dom";
import { useSettingsStore } from "../store/setting";

export default function AppLayout() {
  const theme = useSettingsStore(s => s.theme);

  return (
    <div data-theme={theme} className="w-full h-full">
      <Outlet />
    </div>
  );
}