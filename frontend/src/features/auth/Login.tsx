import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthForm } from "./auth.types";
import { login } from "./useAuth";

interface LoginProps {
  onSwitch: () => void;
}

export default function Login({ onSwitch }: LoginProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<AuthForm>({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await login(form);

    if (!res.success) {
      alert(res.message);
      return;
    }
    navigate("/");
  };
  return (
    <div className="flex items-center justify-center min-h-screen font-gangwon bg-transparent">

      <div className="w-full max-w-sm space-y-10">

        {/* header */}
        <header className="text-center space-y-2">
          <h2 className="text-4xl font-bold">로그인</h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* 아이디 */}
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="아이디"
            className="
              w-full
              bg-white
              border
              border-gray-200
              rounded-lg
              px-4 py-3
              outline-none
              focus:border-gray-400
              transition
            "
          />

          {/* 비밀번호 */}
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="비밀번호"
            className="
              w-full
              bg-white
              border
              font-sans
              border-gray-200
              rounded-lg
              px-4 py-3
              outline-none
              focus:border-gray-400
              transition
            "
          />

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="
              w-full
              py-3
              rounded-xl
              bg-[#1F2A3A]
              text-white
              font-semibold
              hover:bg-[#111827]
              transition
            "
          >
            로그인
          </button>

        </form>

        {/* signup */}
        <div className="text-center text-sm text-gray-500">
          계정이 없나요?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-gray-700 underline"
          >
            회원가입
          </button>
        </div>

      </div>

    </div>
  );
};