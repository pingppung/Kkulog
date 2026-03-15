import { useState } from "react";
import { getMeApi, loginApi, signupApi, checkUsernameApi, logoutApi } from "./api";
import { useAuthStore } from "../../store/auth"
import { AuthForm } from "./auth.types";


export const login = async (form: AuthForm) => {
  const { setUser } = useAuthStore.getState();

  const res = await loginApi(form);

  if (res.success && res.user) {
    setUser(res.user);
  }

  return res;
};


export const signup = async (form: AuthForm) => {
  const res = await signupApi(form);
  return res;
};


export const checkUsername = async (username: string) => {
  const res = await checkUsernameApi(username);
  return res.available;
};


export const checkAuth = async () => {
  const { setUser, clearUser } = useAuthStore.getState();

  const user = await getMeApi();

  if (user) {
    setUser(user);
  } else {
    clearUser();
  }
};


export const logout = async () => {
  const { clearUser } = useAuthStore.getState();

  try {
    await logoutApi();
  } catch (err) {
    console.error("logout failed", err);
  }

  clearUser();
};