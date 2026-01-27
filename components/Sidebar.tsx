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

const DEFAULT_IMAGES = [
  "/img/playlist01.png",
  "/img/playlist02.png", 
  "/img/playlist03.png"
];

export default function Sidebar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [selections, setSelections] = useState<Selection[]>([
    { id: 1, name: "Плейлист дня", image: DEFAULT_IMAGES[0], items: [] },
    { id: 2, name: "100 танцевальных хитов", image: DEFAULT_IMAGES[1], items: [] },
    { id: 3, name: "Инди-заряд", image: DEFAULT_IMAGES[2], items: [] },
  ]);
  const [loadingSelections, setLoadingSelections] = useState(false);

  useEffect(() => {
    loadSelections();
  }, []);

  const loadSelections = async () => {
    try {
      setLoadingSelections(true);
      const data = await trackService.getAllSelections();
      
      console.log('API selections data:', data);
      
      if (data && data.length > 0) {
        const firstThreeSelections = data.slice(0, 3);
        
        const serverSelections: Selection[] = firstThreeSelections.map((selection: any, index: number) => {
          return {
            id: selection.id || selection._id || index + 1,
            name: selection.name || `Подборка ${index + 1}`,
            image: selection.image || DEFAULT_IMAGES[index] || DEFAULT_IMAGES[0],
            items: selection.items || [],
            tracks: selection.tracks || [],
          };
        });
        
        while (serverSelections.length < 3) {
          const index = serverSelections.length;
          serverSelections.push({
            id: index + 1,
            name: `Подборка ${index + 1}`,
            image: DEFAULT_IMAGES[index] || DEFAULT_IMAGES[0],
            items: [],
            tracks: [],
          });
        }
        
        setSelections(serverSelections);
      }
    } catch (error) {
      console.error('Error loading selections:', error);
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
                <div className={styles.selectionInfo}>
                  {selection.name}
                  {selection.items?.length || selection.tracks?.length ? 
                    ` (${selection.items?.length || selection.tracks?.length} треков)` : 
                    ''}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}