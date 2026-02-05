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

const DEFAULT_SELECTIONS = [
  { id: 1, name: "Плейлист дня", image: "/img/playlist01.png" },
  { id: 2, name: "100 танцевальных хитов", image: "/img/playlist02.png" },
  { id: 3, name: "Инди-заряд", image: "/img/playlist03.png" },
];

export default function Sidebar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [selections, setSelections] = useState<Selection[]>(DEFAULT_SELECTIONS);
  const [loadingSelections, setLoadingSelections] = useState(false);

  useEffect(() => {
    loadSelections();
  }, []);

  const loadSelections = async () => {
    try {
      setLoadingSelections(true);
      const data = await trackService.getAllSelections();
      
      if (data && data.length > 0) {
        const apiSelections = data.slice(0, 3).map((selection: any, index: number) => ({
          id: selection.id || selection._id || index + 1,
          name: selection.name || `Подборка ${index + 1}`,
          image: selection.image || `/img/playlist0${(index % 3) + 1}.png`,
        }));
        
        while (apiSelections.length < 3) {
          const index = apiSelections.length;
          apiSelections.push({
            id: index + 1,
            name: DEFAULT_SELECTIONS[index]?.name || `Подборка ${index + 1}`,
            image: DEFAULT_SELECTIONS[index]?.image || `/img/playlist0${(index % 3) + 1}.png`,
          });
        }
        
        setSelections(apiSelections);
      } else {
        setSelections(DEFAULT_SELECTIONS);
      }
    } catch (error) {
      console.error('Error loading selections:', error);
      setSelections(DEFAULT_SELECTIONS);
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
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}