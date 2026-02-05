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

const SELECTION_MAPPING: { [key: string]: string } = {
  'dayplaylist': 'Плейлист дня',
  'dancehits': '100 танцевальных хитов',
  'indiecharge': 'Инди-заряд',
  'Плейлист дня': 'Плейлист дня',
  '100 танцевальных хитов': '100 танцевальных хитов',
  'Инди-заряд': 'Инди-заряд'
};

const SELECTION_IMAGES: { [key: string]: string } = {
  'Плейлист дня': '/img/playlist01.png',
  '100 танцевальных хитов': '/img/playlist02.png',
  'Инди-заряд': '/img/playlist03.png',
  'default': '/img/playlist01.png'
};

export default function Sidebar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [selections, setSelections] = useState<Selection[]>([]);
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
        const formattedSelections: Selection[] = data
          .filter((selection: any) => {
            const name = selection.name || '';
            return (
              name.includes('Плейлист дня') || 
              name.includes('100 танцевальных хитов') || 
              name.includes('Инди-заряд') ||
              name.includes('dayplaylist') ||
              name.includes('dancehits') ||
              name.includes('indiecharge')
            );
          })
          .slice(0, 3) 
          .map((selection: any, index: number) => {
            const originalName = selection.name || '';
            let displayName = originalName;
            
            if (originalName.includes('dayplaylist')) {
              displayName = 'Плейлист дня';
            } else if (originalName.includes('dancehits')) {
              displayName = '100 танцевальных хитов';
            } else if (originalName.includes('indiecharge')) {
              displayName = 'Инди-заряд';
            }
            
            return {
              id: selection.id || selection._id || index + 1,
              name: SELECTION_MAPPING[displayName] || displayName || `Подборка ${index + 1}`,
              image: SELECTION_IMAGES[displayName] || `/img/playlist0${(index % 3) + 1}.png`,
              items: selection.items || [],
              tracks: selection.tracks || [],
            };
          });
        
        if (formattedSelections.length === 0) {
          const defaultSelections = [
            { id: 1, name: "Плейлист дня", image: "/img/playlist01.png", items: [], tracks: [] },
            { id: 2, name: "100 танцевальных хитов", image: "/img/playlist02.png", items: [], tracks: [] },
            { id: 3, name: "Инди-заряд", image: "/img/playlist03.png", items: [], tracks: [] },
          ];
          setSelections(defaultSelections);
        } else {
          setSelections(formattedSelections);
        }
      } else {
        const defaultSelections = [
          { id: 1, name: "Плейлист дня", image: "/img/playlist01.png", items: [], tracks: [] },
          { id: 2, name: "100 танцевальных хитов", image: "/img/playlist02.png", items: [], tracks: [] },
          { id: 3, name: "Инди-заряд", image: "/img/playlist03.png", items: [], tracks: [] },
        ];
        setSelections(defaultSelections);
      }
    } catch (error) {
      console.error('Error loading selections:', error);
      const defaultSelections = [
        { id: 1, name: "Плейлист дня", image: "/img/playlist01.png", items: [], tracks: [] },
        { id: 2, name: "100 танцевальных хитов", image: "/img/playlist02.png", items: [], tracks: [] },
        { id: 3, name: "Инди-заряд", image: "/img/playlist03.png", items: [], tracks: [] },
      ];
      setSelections(defaultSelections);
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