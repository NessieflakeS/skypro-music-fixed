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

    const token = getAccessToken();
    const user = getUser();

    if (token && user) {
      dispatch(loginSuccess(user));
      loadFavorites(); 
    } else {
      dispatch(logout());
      dispatch(setFavoriteTracks([]));
    }
  }, [dispatch, loadFavorites, pathname]);

  return null;
}