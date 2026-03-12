import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";

export default function Main() {
  const { user, loggedIn } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-6">


      <h1 className="text-5xl mb-2 font-jalnan tracking-widest">
        KKULOG
      </h1>

      {/* <div className="w-12 h-[2px] bg-gray-600 mb-6"></div> */}

      <p className="text-gray-500 font-gangwon mb-4 text-center">
        일정과 기록을 한 곳에서 정리하는 개인 로그 공간
      </p>


      <div className="relative mb-4">
        <img
          src="/character3.png"
          alt="character"
          className="w-80 animate-[float_3s_ease-in-out_infinite]"
        />
      </div>
      <div className="w-full max-w-xs flex flex-col gap-3 font-gangwon">

        {!loggedIn ? (
          <button
            onClick={() => navigate("/auth")}
            className="w-full py-3 rounded-lg bg-gray-200 text-gray-500
      hover:bg-gray-400 hover:scale-[1.02] active:scale-[0.98] hover:text-white
      transition-all duration-200 tracking-wide text-lg outline-none"
          >
            로그인
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-3">

            <button
              onClick={() => navigate("/calendar")}
              className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 hover:scale-105 transition"
            >
              📅
              <div className="text-xs">Calendar</div>
            </button>

            <button
              onClick={() => navigate("/diary")}
              className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 hover:scale-105 transition"
            >
              📓
              <div className="text-xs">Diary</div>
            </button>

            <button
              onClick={() => navigate("/finance")}
              className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 hover:scale-105 transition"
            >
              💰
              <div className="text-xs">Finance</div>
            </button>

          </div>
        )}

      </div>

    </div>
  );
}