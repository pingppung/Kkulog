import { useState } from "react";
import { getMeApi, loginApi, signupApi } from "./api";
import { useAuthStore } from "../../store/auth"
import { AuthForm } from "./auth.types";

export default function useAuth() {
  const { setUser, clearUser } = useAuthStore();

  const login = async (form: AuthForm) => {
    const res = await loginApi(form);

    if (res.success && res.user) {
      setUser(res.user);
    }

    return res;
  };

  const signup = async (form: AuthForm) => {
    const res = await signupApi(form);
    return res;
  };

  const logout = () => {
    clearUser();
  };

  const checkAuth = async () => {
    const user = await getMeApi();

    if (user) {
      setUser(user);
    } else {
      clearUser();
    }
  };
  
  return {  login, signup, logout, checkAuth };
}