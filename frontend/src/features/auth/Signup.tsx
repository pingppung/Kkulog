import { useState } from "react";

import { signup, checkUsername } from "./useAuth";

interface SignupProps {
  onSwitch: () => void;
}

export default function Signup({ onSwitch }: SignupProps) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const [form, setForm] = useState({
    username: "",
    password: "",
    passwordConfirm: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "username") {
      setIsAvailable(null);
    }
  };

  const usernameValid =
    /^[a-zA-Z][a-zA-Z0-9]{3,11}$/.test(form.username);

  const passwordValid =
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(form.password);

  const passwordMatch = form.password === form.passwordConfirm;

  const handleCheckUsername = async () => {
    const available = await checkUsername(form.username);
    setIsAvailable(available);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await signup({
      username: form.username,
      password: form.password,
    });

    if (!res.success) {
      alert(res.message);
      return;
    }

    alert("회원가입이 완료되었습니다.");
    onSwitch(); // 로그인 화면으로 전환
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent">

      <div className="w-full max-w-md min-w-[280px] space-y-8 font-gangwon">

        {/* header */}
        <header className="text-center space-y-2">
          <h2 className="text-2xl text-gray-800">회원가입</h2>
          {/* <p className="text-sm text-gray-400">
            계정을 만들어 시작하세요
          </p> */}
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 아이디 */}
          <div className="space-y-1">
            <div className="flex gap-2">
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="아이디"
                required
                className="
                flex-1
                py-3
                px-4
                rounded-lg
                bg-gray-100
                text-gray-700
                placeholder-gray-400
                outline-none
                focus:ring-2 focus:ring-gray-300
                transition
              "
              />

              <button
                type="button"
                onClick={handleCheckUsername}
                disabled={!usernameValid}
                className={`
                  px-3
                  rounded-lg
                  text-sm
                  text-white
                  transition
                  ${usernameValid
                    ? "bg-[#1F2A3A] hover:bg-[#111827]"
                    : "bg-gray-300 cursor-not-allowed"
                  }
  `}
              >
                중복확인
              </button>

            </div>
            {isAvailable === true && (
              <p className="text-sm text-green-500">
                ✔ 사용 가능한 아이디입니다.
              </p>
            )}

            {isAvailable === false && (
              <p className="text-sm text-red-400">
                ⓘ 이미 사용 중인 아이디입니다.
              </p>
            )}
            <p className={`text-sm ${usernameValid ? "text-green-500" : "text-red-400"}`}>
              {usernameValid ? "✔" : "ⓘ"} 영문·숫자 포함 4~12자 입력하세요
            </p>
          </div>


          {/* 비밀번호 */}
          <div className="space-y-1">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호"
              required
              className="
              w-full
              py-3
              px-4
              rounded-lg
              font-sans
              text-gray-700
              bg-gray-100
              placeholder-gray-400
              outline-none
              focus:ring-2 focus:ring-gray-300
              transition
            "
            />

            <p className={`text-sm ${passwordValid ? "text-green-500" : "text-red-400"}`}>
              {passwordValid ? "✔" : "ⓘ"} 영문·숫자 포함 6자 이상 입력하세요
            </p>
          </div>


          {/* 비밀번호 확인 */}
          <div className="space-y-1">
            <input
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              placeholder="비밀번호 확인"
              className="
                w-full
                py-3
                px-4
                font-sans
                rounded-lg
                bg-gray-100
                text-gray-700 
                placeholder-gray-400
                outline-none
                focus:ring-2 focus:ring-gray-300
                transition
              "
            />
            {!passwordMatch && (
              <p className="text-sm text-red-400">
                ⓘ 비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={!passwordValid}
            className={`
              w-full
              py-3
              rounded-xl
              text-white
              font-semibold
              transition
              ${isAvailable && passwordValid && passwordMatch
                ? "bg-[#1F2A3A] hover:bg-[#111827]"
                : "bg-gray-300 cursor-not-allowed"
              }
  `}
          >
            가입하기
          </button>

        </form>


        {/* 로그인 이동 */}
        <div className="text-center text-sm text-gray-500">
          이미 계정이 있나요?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-gray-700 underline"
          >
            로그인
          </button>
        </div>

      </div >

    </div >
  );
} 