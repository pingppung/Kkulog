import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import useAuth from "./features/auth/useAuth";
import MainPage from "./routes/MainPage";
import AuthPage from "./routes/AuthPage";

function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
