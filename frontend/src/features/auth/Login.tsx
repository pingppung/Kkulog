import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm, AuthResult } from "./auth.types";

interface LoginProps {
  onSubmit: (form: AuthForm) => Promise<AuthResult>;
  onSwitch: () => void;
}

export default function Login({ onSubmit, onSwitch }: LoginProps) {
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

    const res = await onSubmit(form);

    if (!res.success) {
      alert(res.message);
      return;
    }
    navigate("/");
  };
  return (
    <div className="flex items-center justify-center min-h-screen">

      <div className="w-full max-w-sm space-y-6 bg-white p-8">

        {/* header */}
        <header className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-700">
            로그인
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 아이디 */}
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="아이디"
            className="w-full bg-indigo-50 rounded-3xl px-4 py-3 text-sm
                     placeholder-gray-400 outline-none
                     focus:ring-2 focus:ring-indigo-200
                     transition"
          />

          {/* 비밀번호 */}
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="비밀번호"
            className="w-full bg-indigo-50 rounded-3xl px-4 py-3 text-sm
                     placeholder-gray-400 outline-none
                     focus:ring-2 focus:ring-indigo-200
                     transition"
          />

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-full py-3 rounded-3xl font-semibold
                     bg-indigo-400 text-white
                     shadow-md hover:scale-[1.02]
                     hover:bg-indigo-500 transition"
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
            className="text-indigo-400 font-medium hover:underline"
          >
            회원가입
          </button>
        </div>

      </div>

    </div>
  );
};