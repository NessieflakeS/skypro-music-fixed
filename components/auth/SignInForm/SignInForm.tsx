'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import classNames from 'classnames';

import { loginStart, loginSuccess, loginFailure, clearError } from '@/store/slices/userSlice';
import { RootState } from '@/store/store';
import { authService } from '@/services/authService';
import { setTokens, setUser } from '@/services/tokenManager';
import { useLoadFavorites } from '@/hooks/useLoadFavorites';

import styles from './SignInForm.module.css';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.user);
  const loadFavorites = useLoadFavorites();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirect);
    }
  }, [isAuthenticated, router, redirect]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const data = await authService.login({ email, password });

      setTokens(data.access, data.refresh);
      setUser(data.user);

      dispatch(loginSuccess(data.user));

      await loadFavorites();

      router.replace(redirect);
    } catch (err: unknown) {
      let message = 'Ошибка входа';
      if (err instanceof Error) {
        message = err.message;
      }
      dispatch(loginFailure(message));
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.containerEnter}>
        <div className={styles.modal__block}>
          <form className={styles.modal__form} onSubmit={handleSubmit}>
            <Link href="/">
              <div className={styles.modal__logo}>
                <img src="/img/logo_modal.png" alt="logo" />
              </div>
            </Link>
            <input
              className={classNames(styles.modal__input, styles.login)}
              type="email"
              name="email"
              placeholder="Почта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <input
              className={classNames(styles.modal__input)}
              type="password"
              name="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <div className={styles.errorContainer}>
              {error && <p className={styles.errorText}>{error}</p>}
            </div>
            <button type="submit" className={styles.modal__btnEnter} disabled={loading}>
              {loading ? 'Загрузка...' : 'Войти'}
            </button>
            <Link href="/signup" className={styles.modal__btnSignup}>
              Зарегистрироваться
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}