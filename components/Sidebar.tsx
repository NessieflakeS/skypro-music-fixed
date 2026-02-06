"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./Sidebar.module.css";
import { RootState } from "@/store/store";
import { logout } from "@/store/userSlice";
import { trackService } from "@/services/trackService";
import Cookies from 'js-cookie';

interface Selection {
  id: number;
  name: string;
  image: string;
  items?: any[];
  tracks?: any[];
}

const FIXED_SELECTIONS: Selection[] = [
  { 
    id: 1, 
    name: "Плейлист дня", 
    image: "/img/playlist01.png",
    items: [],
    tracks: []
  },
  { 
    id: 2, 
    name: "100 танцевальных хитов", 
    image: "/img/playlist02.png",
    items: [],
    tracks: []
  },
  { 
    id: 3, 
    name: "Инди-заряд", 
    image: "/img/playlist03.png",
    items: [],
    tracks: []
  },
];

export default function Sidebar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [selections, setSelections] = useState<Selection[]>(FIXED_SELECTIONS);
  const [loadingSelections, setLoadingSelections] = useState(false);

  useEffect(() => {
    loadSelections();
  }, []);

  const loadSelections = async () => {
    try {
      setLoadingSelections(true);
      
      console.log("Запрашиваем подборки из API...");
      const data = await trackService.getAllSelections();
      console.log("Ответ от API (все подборки):", data);
      
      if (data && data.length > 0) {
        const meaningfulSelections = data.filter((selection: any) => {
          const name = (selection.name || '').toLowerCase();
          return (
            name.includes('плейлист') ||
            name.includes('playlist') ||
            name.includes('хит') ||
            name.includes('hit') ||
            name.includes('инди') ||
            name.includes('indie') ||
            name.includes('танц') ||
            name.includes('dance')
          );
        });
        
        console.log("Осмысленные подборки:", meaningfulSelections);
        
        if (meaningfulSelections.length >= 3) {
          const formattedSelections = meaningfulSelections.slice(0, 3).map((selection: any, index: number) => ({
            id: selection.id || selection._id || index + 1,
            name: selection.name || `Подборка ${index + 1}`,
            image: `/img/playlist0${index + 1}.png`,
            items: selection.items || [],
            tracks: selection.tracks || [],
          }));
          setSelections(formattedSelections);
        } else {
          console.log("Используем фиксированные подборки");
          setSelections(FIXED_SELECTIONS);
        }
      } else {
        console.log("API не вернул данные, используем фиксированные подборки");
        setSelections(FIXED_SELECTIONS);
      }
    } catch (error) {
      console.error('Ошибка загрузки подборок:', error);
      setSelections(FIXED_SELECTIONS);
    } finally {
      setLoadingSelections(false);
    }
  };

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

  const handleLogin = () => {
    router.push('/signin');
  };

  const handleRegister = () => {
    router.push('/signup');
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebar__personal}>
        <p className={styles.sidebar__personalName}>
          {isAuthenticated ? user?.username || "Пользователь" : "Гость"}
        </p>
        {isAuthenticated ? (
          <div className={styles.sidebar__icon} onClick={handleLogout}>
            <svg>
              <use xlinkHref="/img/icon/sprite.svg#logout"></use>
            </svg>
          </div>
        ) : (
          <div className={styles.sidebar__authButtons}>
            <button onClick={handleLogin} className={styles.sidebar__authButton}>
              Войти
            </button>
            <button onClick={handleRegister} className={styles.sidebar__authButton}>
              Регистрация
            </button>
          </div>
        )}
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
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}