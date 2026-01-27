"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";
import { logout } from "@/store/userSlice";
import { RootState } from "@/store/store";
import Cookies from 'js-cookie';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const savedState = localStorage.getItem('menuOpen');
    if (savedState !== null) {
      setIsMenuOpen(savedState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('menuOpen', isMenuOpen.toString());
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      dispatch(logout());
      
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('menuOpen');
      
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      Cookies.remove('token');
      Cookies.remove('refresh_token');
      
      console.log('Logout successful, redirecting to signin...');
      
      router.replace('/signin');
      
      setTimeout(() => {
        window.location.href = '/signin';
      }, 100);
      
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      router.replace('/signin');
    }
  };

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
      <div className={`${styles.nav__menu} ${isMenuOpen ? styles.nav__menu_active : ''}`}>
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
                <span className={styles.menu__link}>
                  Привет, {user?.username}
                </span>
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