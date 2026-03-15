import { useEffect } from "react";
import { logout } from "../features/auth/useAuth";
import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { LogOut } from "lucide-react";

export default function Main() {
  const { user, loggedIn } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    invoke("set_edit_mode", { isEdit: true });
  }, []);


  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">

      {/* Tauri Drag Header */}
      <div
        data-tauri-drag-region
        className="h-9 flex items-center px-2 flex-shrink-0 
        bg-gray-100 border-b border-gray-200 cursor-move"
      />

      <div className="absolute top-12 right-6">
        {loggedIn && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm 
      text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        )}
      </div>

      {/* Center Area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">

        {/* Scale Wrapper */}
        <div
          className="flex flex-col items-center gap-1 px-6"
        >

          {/* Title */}
          <h1 className="text-[clamp(24px,6vw,48px)] font-jalnan tracking-widest">
            KKULOG
          </h1>

          {/* Description */}
          <p className="text-[clamp(12px,2.5vw,18px)] text-gray-500 font-gangwon text-center">
            일정과 기록을 한 곳에서 정리하는 개인 로그 공간
          </p>

          {/* Character */}
          <img
            src="/character3.png"
            alt="character"
            className="w-[clamp(200px,45vw,320px)] animate-[float_3s_ease-in-out_infinite]"
          />

          {/* Buttons */}
          <div className="w-full max-w-xs flex flex-col gap-3 font-gangwon">

            {!loggedIn ? (
              <button
                onClick={() => navigate("/auth")}
                className="w-full py-3 rounded-lg bg-gray-200 text-gray-500
                hover:bg-gray-400 hover:text-white
                hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-200 text-lg"
              >
                로그인
              </button>
            ) : (

              <div className="grid grid-cols-3 gap-3">

                <button
                  onClick={() => navigate("/calendar")}
                  className="w-full py-3 text-center rounded-xl bg-gray-100 hover:bg-gray-200 hover:scale-105 transition"
                >
                  <img
                    src="/calendar_icon.png"
                    alt="calendar"
                    className="w-[clamp(24px,10vw,64px)] mx-auto animate-[float_3s_ease-in-out_infinite]"
                  />
                  <div className="text-sm">Calendar</div>
                </button>

                <button
                  onClick={() => navigate("/diary")}
                  className="w-full py-3 text-center rounded-xl bg-gray-100 hover:bg-gray-200 hover:scale-105 transition"
                >
                  <img
                    src="/diary_icon.png"
                    alt="diary"
                    className="w-[clamp(24px,10vw,64px)] mx-auto animate-[float_3s_ease-in-out_infinite]"
                  />
                  <div className="text-sm">Diary</div>
                </button>

                <button
                  onClick={() => navigate("/finance")}
                  className="w-full py-3 text-center rounded-xl bg-gray-100 hover:bg-gray-200 hover:scale-105 transition"
                >
                  <img
                    src="/finance_icon.png"
                    alt="finance"
                    className="w-[clamp(24px,10vw,64px)] mx-auto animate-[float_3s_ease-in-out_infinite]"
                  />
                  <div className="text-sm">Finance</div>
                </button>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}