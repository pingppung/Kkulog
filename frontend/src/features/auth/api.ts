import axios from "axios";
import { AuthForm, AuthResult, User } from "./auth.types";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

// 로그인
export const loginApi = async (
  form: AuthForm
): Promise<AuthResult> => {
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

// 회원가입
export const signupApi = async (
  form: AuthForm
): Promise<AuthResult> => {
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
  try {
    const { data } = await api.get<{ user: User }>("/auth/me", {
      withCredentials: true,
    });

    return data.user;
  } catch {
    return null;
  }
};