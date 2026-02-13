"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import classNames from "classnames";

import { registerStart, registerSuccess, registerFailure, clearError, setFavoriteTracks } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";
import { authService } from "@/services/authService";
import { setTokens, setUser } from "@/services/tokenManager";
import { trackService } from "@/services/trackService";

import styles from "./SignUpForm.module.css";

export default function SignUpForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.user);

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

  const validateForm = () => {
    if (password !== confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("Пароль должен содержать минимум 6 символов");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(registerStart());

    try {
      const data = await authService.register({ email, password, username });

      setTokens(data.access, data.refresh);
      setUser(data.user);

      dispatch(registerSuccess(data.user));

      try {
        console.log("Загрузка избранных треков после регистрации...");
        const favoriteTracksData = await trackService.getFavoriteTracks();
        const trackIds = favoriteTracksData.map((track) => track.id || track._id || 0);
        dispatch(setFavoriteTracks(trackIds));
      } catch (favError) {
        console.error("Ошибка загрузки избранных треков после регистрации:", favError);
        dispatch(setFavoriteTracks([]));
      }

      router.replace(redirect);
    } catch (err: any) {
      dispatch(registerFailure(err.message || "Ошибка регистрации"));
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
            <button type="submit" className={styles.modal__btnSignupEnt} disabled={loading}>
              {loading ? "Загрузка..." : "Зарегистрироваться"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}