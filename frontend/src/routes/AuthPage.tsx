import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../features/auth/Login";
import Signup from "../features/auth/Signup";
import { ArrowLeft } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      {/* 뒤로가기 */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <ArrowLeft size={24} />
      </button>

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