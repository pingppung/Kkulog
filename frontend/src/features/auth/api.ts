import axios from "axios";
import type { AuthForm, AuthResult, User } from "./auth.types";

// 계정 기능을 다시 연결할 때 활성화합니다. 현재는 서버 요청을 보내지 않습니다.
const AUTH_ENABLED = false;
const disabledMessage = "현재는 로그인 없이 로컬 저장 기능을 사용합니다.";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

// 로그인
export const loginApi = async (
  form: AuthForm
): Promise<AuthResult> => {
  if (!AUTH_ENABLED) {
    return { success: false, message: disabledMessage };
  }
  try {
    const { data } = await api.post<AuthResult>(
      "/auth/login",
      form,
      { withCredentials: true }
    );

    return data;

  } catch (err: any) {
    return err.response.data;
  }
};

// 아이디 중복 확인
export const checkUsernameApi = async (username: string) => {
  if (!AUTH_ENABLED) {
    return { available: false, message: disabledMessage };
  }
  try {
    const { data } = await api.get("/auth/check-username", {
      params: { username },
    });

    return data; // 사용 가능
  } catch (err: any) {
    return err.response.data; // 중복 메시지
  }
};

// 회원가입
export const signupApi = async (
  form: AuthForm
): Promise<AuthResult> => {
  if (!AUTH_ENABLED) {
    return { success: false, message: disabledMessage };
  }
  try {
    const { data } = await api.post<AuthResult>(
      "/auth/signup",
      form,
      // { withCredentials: true } // signup 후 자동 로그인
    );

    return data;
  } catch (err: any) {
    return err.response.data;
  }
};

// 사용자 정보 가져오기 (로그인 상태 풀릴 가능성)
export const getMeApi = async (): Promise<User | null> => {
  if (!AUTH_ENABLED) return null;
  try {
    const { data } = await api.get<{ user: User }>("/auth/me", {
      withCredentials: true,
    });

    return data.user;
  } catch {
    return null;
  }
};

//로그아웃
export const logoutApi = async () => {
  if (!AUTH_ENABLED) return;
  await api.post("/auth/logout", {}, {
    withCredentials: true
  });
};
