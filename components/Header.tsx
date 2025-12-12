"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(true); // Изначально открыто для теста

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    console.log("Menu toggled, isMenuOpen:", !isMenuOpen); // Для отладки
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
      <div className={`${styles.nav__menu} ${isMenuOpen ? styles.nav__menu_active : ""}`}>
        <ul className={styles.menu__list}>
          <li className={styles.menu__item}>
            <Link href="/" className={styles.menu__link}>
              Главное
            </Link>
          </li>
          <li className={styles.menu__item}>
            <Link href="/my-playlist" className={styles.menu__link}>
              Мой плейлист
            </Link>
          </li>
          <li className={styles.menu__item}>
            <Link href="/logout" className={styles.menu__link}>
              Выйти
            </Link>
          </li>
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