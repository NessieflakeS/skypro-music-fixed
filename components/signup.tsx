"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { registerStart, registerSuccess, registerFailure, clearError } from '@/store/userSlice';
import { RootState } from '@/store/store';
import { authService } from '@/services/authService';
import styles from './signup.module.css';
import classNames from 'classnames';
import Link from 'next/link';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
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

  const validateForm = () => {
    let isValid = true;
    
    if (password !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    if (password.length < 6) {
      setPasswordError('Пароль должен содержать минимум 6 символов');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    dispatch(registerStart());

    try {
      const data = await authService.register({ email, password, username });
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      dispatch(registerSuccess(data.user));
      router.push('/');
    } catch (err: any) {
      let errorMessage = 'Ошибка регистрации';
      
      if (err.response) {
        if (err.response.data?.email) {
          errorMessage = `Email: ${err.response.data.email[0]}`;
        } else if (err.response.data?.username) {
          errorMessage = `Имя пользователя: ${err.response.data.username[0]}`;
        } else if (err.response.data?.password) {
          errorMessage = `Пароль: ${err.response.data.password[0]}`;
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      dispatch(registerFailure(errorMessage));
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
                className={classNames(styles.modal__input)}
                type="text"
                name="username"
                placeholder="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
              <input
                className={classNames(styles.modal__input)}
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
              <input
                className={classNames(styles.modal__input)}
                type="password"
                name="confirmPassword"
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
              <div className={styles.errorContainer}>
                {(error || passwordError) && (
                  <p className={styles.errorText}>{error || passwordError}</p>
                )}
              </div>
              <button 
                type="submit" 
                className={styles.modal__btnSignupEnt}
                disabled={loading}
              >
                {loading ? 'Загрузка...' : 'Зарегистрироваться'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}