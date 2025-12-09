import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/auth/signup", form);
      // alert("회원가입 완료");
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || "회원가입 실패했습니다.";

      alert(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-lg">
        
        <h1 className="mb-2 text-3xl font-bold text-gray-900 text-center">
          회원가입
        </h1>
        <p className="mb-8 text-center text-gray-500">
          아이디와 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 아이디 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              아이디
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="
                w-full 
                h-12
                rounded-lg 
                border border-gray-300 
                px-4 
                text-base 
                focus:border-gray-900 
                focus:outline-none 
                focus:ring-1 
                focus:ring-gray-900
              "
              placeholder="your_id"
              required
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="
                w-full 
                h-12
                rounded-lg 
                border border-gray-300 
                px-4 
                text-base
                focus:border-gray-900 
                focus:outline-none 
                focus:ring-1 
                focus:ring-gray-900
              "
              placeholder="••••••••"
              required
            />
          </div>

          {/* 버튼 */}
          <button
            type="submit"
            className="
              w-full 
              h-12 
              rounded-lg 
              bg-gray-900 
              text-white 
              text-base 
              font-semibold
              hover:bg-black
              transition
            "
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}
