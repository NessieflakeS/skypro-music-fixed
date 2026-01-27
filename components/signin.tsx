"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { loginStart, loginSuccess, loginFailure, clearError } from '@/store/userSlice';
import { RootState } from '@/store/store';
import { authService } from '@/services/authService';
import styles from './signin.module.css';
import classNames from 'classnames';
import Link from 'next/link';

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

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
      
      const token = data.access || data.access_token;
      const refreshToken = data.refresh || data.refresh_token;
      
      if (token && refreshToken) {
        localStorage.setItem('token', token);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        dispatch(loginSuccess(data.user));
        router.push('/');
      } else {
        throw new Error('Не удалось получить токены авторизации');
      }
    } catch (err: any) {
      dispatch(loginFailure(err.message || 'Ошибка входа'));
    }
  };

  return (
    <>
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
              <button 
                type="submit" 
                className={styles.modal__btnEnter}
                disabled={loading}
              >
                {loading ? 'Загрузка...' : 'Войти'}
              </button>
              <Link href="/signup" className={styles.modal__btnSignup}>
                Зарегистрироваться
              </Link>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}