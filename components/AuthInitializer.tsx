"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "@/store/userSlice";

export function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(loginSuccess(user));
      } catch (error) {
        console.error('Ошибка парсинга пользователя:', error);
        clearAuthData();
        dispatch(logout());
      }
    } else {
      clearAuthData();
      dispatch(logout());
    }
  }, [dispatch]);

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  return null;
}