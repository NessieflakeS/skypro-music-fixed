"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./Sidebar.module.css";
import { RootState } from "@/store/store";
import { logout } from "@/store/userSlice";

interface SelectionDisplay {
  id: number;
  name: string;
  image: string;
}

export default function Sidebar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [selections, setSelections] = useState<SelectionDisplay[]>([
    { id: 1, name: "Плейлист дня", image: "/img/playlist01.png" },
    { id: 2, name: "100 танцевальных хитов", image: "/img/playlist02.png" },
    { id: 3, name: "Инди-заряд", image: "/img/playlist03.png" },
  ]);

  const handleLogout = async () => {
    console.log('Sidebar logout clicked');
    try {
      dispatch(logout());
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('menuOpen');
      }
      
      console.log('Redirecting to signin from sidebar');
      router.push('/signin');
      
      window.location.href = '/signin';
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      router.push('/signin');
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
          {selections.map((selection) => (
            <div key={selection.id} className={styles.sidebar__item}>
              <Link className={styles.sidebar__link} href={`/playlist/${selection.id}`}>
                <Image
                  className={styles.sidebar__img}
                  src={selection.image}
                  alt={selection.name}
                  width={250}
                  height={150}
                  priority={selection.id === 1}
                />
                <div style={{ 
                  color: 'white', 
                  textAlign: 'center', 
                  marginTop: '5px',
                  fontSize: '14px'
                }}>
                  {selection.name}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}