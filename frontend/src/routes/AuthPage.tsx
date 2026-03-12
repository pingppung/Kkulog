import { useState } from "react";
import Login from "../features/auth/Login";
import Signup from "../features/auth/Signup";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* form */}
      {mode === "login" ? (
        <Login
          onSwitch={() => setMode("signup")}
        />
      ) : (
        <Signup
          onSwitch={() => setMode("login")}
        />
      )}


    </div>
  );
}