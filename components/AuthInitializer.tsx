"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { loginSuccess, logout, setFavoriteTracks } from "@/store/userSlice";
import { RootState } from "@/store/store";
import { trackService } from "@/services/trackService";

export default function AuthInitializer() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('menuOpen');
    
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }, []);

  const loadFavoriteTracks = useCallback(async () => {
    try {
      const tracks = await trackService.getFavoriteTracks();
      const trackIds = tracks.map(track => track.id || track._id || 0);
      dispatch(setFavoriteTracks(trackIds));
    } catch (error) {
      console.error('Ошибка загрузки избранных треков:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(loginSuccess(user));
        loadFavoriteTracks();
      } catch (error) {
        console.error('Ошибка парсинга пользователя:', error);
        clearAuthData();
        dispatch(logout());
        
        if (pathname === '/favorites') {
          router.push('/signin');
        }
      }
    } else {
      dispatch(logout());
    }
  }, [dispatch, loadFavoriteTracks, clearAuthData, pathname, router]);

  useEffect(() => {
    if (!isAuthenticated && pathname === '/favorites') {
      router.push('/signin');
    }
    
    if (isAuthenticated && (pathname === '/signin' || pathname === '/signup')) {
      router.push('/');
    }
  }, [isAuthenticated, pathname, router]);

  return null;
}