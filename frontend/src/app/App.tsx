import AppLayout from "../layouts/AppLayout";
import CalendarPage from "../routes/calendar/CalendarPage";
import SettingsPage from "../routes/SettingsPage";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
export default function App() {
  // AuthPage와 MainPage는 보관만 하고 현재 라우트에는 연결하지 않습니다.
  return <HashRouter><Routes><Route element={<AppLayout />}>
    <Route path="/" element={<CalendarPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/settings/colors" element={<Navigate to="/settings?tab=display" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route></Routes></HashRouter>;
}
