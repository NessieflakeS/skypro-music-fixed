import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '@/store/slices/userSlice';
import { clearTokens } from '@/services/tokenManager';

export const useLogout = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = useCallback(
    async (redirectTo = '/signin') => {
      try {
        dispatch(logout());
        clearTokens();
        localStorage.removeItem('menuOpen');
        router.replace(redirectTo);
      } catch (error) {
        console.error('Ошибка при выходе:', error);
        router.replace('/signin');
      }
    },
    [dispatch, router]
  );

  return handleLogout;
};