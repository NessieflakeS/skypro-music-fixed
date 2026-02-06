"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./Sidebar.module.css";
import { RootState } from "@/store/store";
import { logout } from "@/store/userSlice";
import Cookies from 'js-cookie';

interface Selection {
  id: number;
  name: string;
  image: string;
}

const FIXED_PLAYLISTS = [
  { 
    id: 2,
    name: "Плейлист дня", 
    image: "/img/playlist01.png"
  },
  { 
    id: 3, 
    name: "100 танцевальных хитов", 
    image: "/img/playlist02.png"
  },
  { 
    id: 4, 
    name: "Инди-заряд", 
    image: "/img/playlist03.png"
  },
];

export default function Sidebar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);

  const handleLogout = async () => {
    try {
      dispatch(logout());
      
      Cookies.remove('token');
      Cookies.remove('refresh_token');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('menuOpen');
      
      router.replace('/signin');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      router.replace('/signin');
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebar__personal}>
        <p className={styles.sidebar__personalName}>
          {isAuthenticated ? user?.username || "Пользователь" : "Гость"}
        </p>
        <div className={styles.sidebar__icon} onClick={handleLogout}>
          <svg>
            <use xlinkHref="/img/icon/sprite.svg#logout"></use>
          </svg>
        </div>
      </div>
      <div className={styles.sidebar__block}>
        <div className={styles.sidebar__list}>
          {FIXED_PLAYLISTS.map((playlist) => (
            <div key={playlist.id} className={styles.sidebar__item}>
              <Link className={styles.sidebar__link} href={`/playlist/${playlist.id}`}>
                <Image
                  className={styles.sidebar__img}
                  src={playlist.image}
                  alt={playlist.name}
                  width={250}
                  height={150}
                  priority={playlist.id === 2}
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}