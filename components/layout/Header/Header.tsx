"use client";

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import styles from "./Header.module.css";
import { logout } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";
import { clearTokens } from "@/services/tokenManager";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const savedState = localStorage.getItem("menuOpen");
    if (savedState !== null) {
      setIsMenuOpen(savedState === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("menuOpen", isMenuOpen.toString());
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = useCallback(async () => {
    try {
      dispatch(logout());
      clearTokens();
      localStorage.removeItem("menuOpen");

      if (pathname === "/favorites") {
        router.replace("/");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      router.replace("/signin");
    }
  }, [dispatch, router, pathname]);

  return (
    <nav className={styles.nav}>
      <div className={styles.nav__logo}>
        <Link href="/">
          <Image
            className={styles.logo__image}
            src="/img/logo.png"
            alt="Skypro.Music логотип"
            width={113}
            height={17}
            priority
          />
        </Link>
      </div>
      <div className={styles.nav__burger} onClick={toggleMenu}>
        <span className={styles.burger__line}></span>
        <span className={styles.burger__line}></span>
        <span className={styles.burger__line}></span>
      </div>
      <div
        className={`${styles.nav__menu} ${isMenuOpen ? styles.nav__menu_active : ""}`}
      >
        <ul className={styles.menu__list}>
          <li className={styles.menu__item}>
            <Link href="/" className={styles.menu__link}>
              Главное
            </Link>
          </li>
          <li className={styles.menu__item}>
            <Link href="/favorites" className={styles.menu__link}>
              Мой плейлист
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              <li className={styles.menu__item}>
                <span className={styles.menu__link}>Привет, {user?.username}</span>
              </li>
              <li className={styles.menu__item}>
                <button
                  onClick={handleLogout}
                  className={`${styles.menu__link} ${styles.logoutButton}`}
                >
                  Выйти
                </button>
              </li>
            </>
          ) : (
            <>
              <li className={styles.menu__item}>
                <Link href="/signin" className={styles.menu__link}>
                  Войти
                </Link>
              </li>
              <li className={styles.menu__item}>
                <Link href="/signup" className={styles.menu__link}>
                  Регистрация
                </Link>
              </li>
            </>
          )}
          <li className={`${styles.menu__item} ${styles.menu__itemIcon}`}>
            <button className={styles.themeToggle} aria-label="Сменить тему">
              <img
                src="/img/icon/day-night.svg"
                alt="Сменить тему"
                className={styles.themeToggle__icon}
              />
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}