'use client';

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { usePathname } from 'next/navigation';

import { loginSuccess, logout, setFavoriteTracks } from '@/store/slices/userSlice';
import { getAccessToken, getUser } from '@/services/tokenManager';
import { useLoadFavorites } from '@/hooks/useLoadFavorites';

export default function AuthInitializer() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const initializedRef = useRef(false);
  const loadFavorites = useLoadFavorites();

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    console.log('AuthInitializer запущен, путь:', pathname);

    const token = getAccessToken();
    const user = getUser();

    if (token && user) {
      console.log('Восстановление сессии для:', user.username);
      dispatch(loginSuccess(user));
      loadFavorites(); 
    } else {
      console.log('Пользователь не авторизован');
      dispatch(logout());
      dispatch(setFavoriteTracks([]));
    }
  }, [dispatch, loadFavorites, pathname]);

  return null;
}