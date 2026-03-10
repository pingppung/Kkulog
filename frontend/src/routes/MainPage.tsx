import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";

export default function Main() {
  const { user, loggedIn } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="flex justify-between items-center px-8 py-5 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-indigo-600">Kkulog</h1>

        {loggedIn ? (
          <div className="text-gray-700 font-medium">
            👋 {user?.username}님
          </div>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            로그인
          </button>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-lg">

          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            당신의 기록 공간
          </h2>

          <p className="text-gray-600 mb-8">
            캘린더, 일기, 가계부를 한 곳에서 관리하세요.
          </p>

          {loggedIn ? (
            <button
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow hover:bg-indigo-700 transition"
            >
              시작하기
            </button>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow hover:bg-indigo-700 transition"
            >
              로그인 / 회원가입
            </button>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-400 py-4">
        © 2026 Kkulog
      </footer>

    </div>
  );
}