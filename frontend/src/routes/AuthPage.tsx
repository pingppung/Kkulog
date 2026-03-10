import { useState } from "react";
import Login from "../features/auth/Login";
import Signup from "../features/auth/Signup";
import useAuth from "../features/auth/useAuth";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { login, signup } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen">


      {/* form */}
      {mode === "login" ? (
        <Login
          onSubmit={login}
          onSwitch={() => setMode("signup")}
        />
      ) : (
        <Signup
          onSubmit={signup}
          onSwitch={() => setMode("login")}
        />
      )}


    </div>
  );
}