"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "@/store/userSlice";
import Cookies from 'js-cookie';

export function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(loginSuccess(user));
        
        if (!Cookies.get('token')) {
          Cookies.set('token', token, { expires: 7 });
        }
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
    Cookies.remove('token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  return null;
}