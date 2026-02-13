"use client";

import { useEffect, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { loginSuccess, logout, setFavoriteTracks } from "@/store/slices/userSlice";
import { trackService } from "@/services/trackService";
import { getAccessToken, getUser, setUser, setTokens } from "@/services/tokenManager";

export default function AuthInitializer() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const initializedRef = useRef(false);
  const favoritesLoadedRef = useRef(false);

  const loadFavoriteTracks = useCallback(async () => {
    if (favoritesLoadedRef.current) {
      console.log("Избранные треки уже загружены, пропускаем");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("Нет токена, пропускаем загрузку избранных треков");
        dispatch(setFavoriteTracks([]));
        favoritesLoadedRef.current = true;
        return;
      }

      console.log("Загрузка избранных треков...");
      const favoriteTracks = await trackService.getFavoriteTracks();
      const trackIds = favoriteTracks.map(track => track.id || track._id || 0);
      console.log("Загружено избранных треков:", trackIds.length);
      dispatch(setFavoriteTracks(trackIds));
      favoritesLoadedRef.current = true;
    } catch (error) {
      console.error("Ошибка загрузки избранных треков:", error);
      dispatch(setFavoriteTracks([]));
    }
  }, [dispatch]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    console.log("AuthInitializer запущен, путь:", pathname);
    
    const token = getAccessToken();
    const userStr = getUser();
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("Восстановление сессии для:", user.username);
        dispatch(loginSuccess(user));
        
        setTimeout(() => {
          loadFavoriteTracks();
        }, 500);
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
      dispatch(setFavoriteTracks([]));
    }
  }, [dispatch, loadFavoriteTracks, pathname]);

  return null;
}