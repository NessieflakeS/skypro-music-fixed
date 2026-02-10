"use client";

import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { loginSuccess, logout, setFavoriteTracks } from "@/store/userSlice";
import { trackService } from "@/services/trackService";

export default function AuthInitializer() {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const loadFavoriteTracks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log("AuthInitializer: Загрузка избранных треков...");
      const favoriteTracks = await trackService.getFavoriteTracks();
      const trackIds = favoriteTracks.map(track => track.id || track._id || 0);
      console.log("Загружено избранных треков:", trackIds.length);
      dispatch(setFavoriteTracks(trackIds));
    } catch (error) {
      console.error("Ошибка загрузки избранных треков:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    console.log("AuthInitializer запущен, путь:", pathname);
    
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        console.log("Восстановление сессии для:", userData.username);
        dispatch(loginSuccess(userData));
        loadFavoriteTracks();
      } catch (error) {
        console.error("Ошибка парсинга user из localStorage:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        dispatch(logout());
      }
    } else {
      console.log("Пользователь не авторизован");
      dispatch(logout());
    }
  }, [dispatch, loadFavoriteTracks]);

  return null;
}