
import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import CalendarPage from "../routes/calendar/CalendarPage";
import MainPage from "../routes/MainPage";
import AuthPage from "../routes/AuthPage";

import { useAuthStore } from "../store/auth";
import { getMeApi } from "../features/auth/api";

function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getMeApi();

      if (user) {
        setUser(user);
      } else {
        clearUser();
      }
    };

    checkAuth();
  }, []);
  
  return (
    <HashRouter>
      <Routes>

        {/* 랜딩 */}
        <Route path="/" element={<MainPage />} />

        {/* 로그인 */}
        <Route path="/auth" element={<AuthPage />} />

        {/* 앱 영역 */}
        <Route element={<AppLayout />}>
          <Route path="/calendar" element={<CalendarPage />} />
          {/* <Route path="/diary" element={<DiaryPage />} />
          <Route path="/finance" element={<FinancePage />} /> */}
        </Route>

      </Routes>
    </HashRouter>
  );
}

export default App;
