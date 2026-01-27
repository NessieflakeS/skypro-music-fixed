"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./Sidebar.module.css";
import { RootState } from "@/store/store";
import { logout } from "@/store/userSlice";
import { authService } from "@/services/authService";
import { trackService } from "@/services/trackService";

interface SelectionDisplay {
  id: number;
  name: string;
  image: string;
  trackCount: number;
}

export default function Sidebar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [selections, setSelections] = useState<SelectionDisplay[]>([
    { id: 1, name: "Плейлист дня", image: "/img/playlist01.png", trackCount: 0 },
    { id: 2, name: "100 танцевальных хитов", image: "/img/playlist02.png", trackCount: 0 },
    { id: 3, name: "Инди-заряд", image: "/img/playlist03.png", trackCount: 0 },
  ]);
  const [loadingSelections, setLoadingSelections] = useState(false);

  useEffect(() => {
    loadSelections();
  }, []);

  const loadSelections = async () => {
    try {
      setLoadingSelections(true);
      const data = await trackService.getAllSelections();
      
      if (data.length > 0) {
        const serverSelections: SelectionDisplay[] = data.slice(0, 3).map((selection, index) => {
          let image = "/img/playlist01.png";
          if (index === 1) image = "/img/playlist02.png";
          if (index === 2) image = "/img/playlist03.png";
          
          const trackCount = (selection.items?.length || 0) + (selection.tracks?.length || 0);
          
          return {
            id: selection.id,
            name: selection.name || `Подборка ${selection.id}`,
            image: image,
            trackCount: trackCount
          };
        });
        
        while (serverSelections.length < 3) {
          const index = serverSelections.length;
          serverSelections.push({
            id: index + 1,
            name: ["Плейлист дня", "100 танцевальных хитов", "Инди-заряд"][index] || `Подборка ${index + 1}`,
            image: ["/img/playlist01.png", "/img/playlist02.png", "/img/playlist03.png"][index] || "/img/playlist01.png",
            trackCount: 0
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
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('menuOpen');
      }
      
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