"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";
import { logout } from "@/store/userSlice";
import { RootState } from "@/store/store";

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
    console.log('Toggling menu, current state:', isMenuOpen);
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    console.log('Logout clicked');
    try {
      dispatch(logout());
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('menuOpen');
      }
      
      console.log('Redirecting to signin');
      router.push('/signin');
      
      window.location.href = '/signin';
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      router.push('/signin');
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Login link clicked');
    router.push('/signin');
  };

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Register link clicked');
    router.push('/signup');
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
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    font: 'inherit',
                    color: 'inherit',
                    padding: 0,
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  Выйти
                </button>
              </li>
            </>
          ) : (
            <>
              <li className={styles.menu__item}>
                <button 
                  onClick={handleLoginClick}
                  className={`${styles.menu__link} ${styles.logoutButton}`}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    font: 'inherit',
                    color: 'inherit',
                    padding: 0,
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  Войти
                </button>
              </li>
              <li className={styles.menu__item}>
                <button 
                  onClick={handleRegisterClick}
                  className={`${styles.menu__link} ${styles.logoutButton}`}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    font: 'inherit',
                    color: 'inherit',
                    padding: 0,
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  Регистрация
                </button>
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