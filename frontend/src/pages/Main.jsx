import { useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../store/auth";

export default function Main() {
  const { username, loggedIn, setUser, clearUser } = useAuthStore();

  // 페이지 들어올 때 로그인 여부 확인
  useEffect(() => {
    axios
        .get("http://localhost:4000/auth/me", {
        withCredentials: true,
        })
        .then((res) => {
        if (res.data.loggedIn) {
            setUser(res.data.username);
        } else {
            clearUser();
        }
        })
        .catch(() => {
        clearUser();
        });
}, []);


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h1 className="text-xl font-semibold">Kkulog</h1>

        {loggedIn ? (
          <span className="text-gray-700">👋 {username}님</span>
        ) : (
          <span className="text-gray-500">로그인이 필요합니다</span>
        )}
      </header>

      <main className="p-6">
        {loggedIn ? (
          <div className="text-lg text-gray-800">
            환영합니다! 이제 기능을 이용할 수 있어요.
          </div>
        ) : (
          <div className="text-gray-600">
            로그인을 먼저 진행해 주세요.
          </div>
        )}
      </main>
    </div>
  );
}
