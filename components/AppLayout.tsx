"use client";

import { ReactNode } from "react";
import { useSelector } from "react-redux";
import AudioManager from "@/components/AudioManager";
import { RootState } from "@/store/store";
import styles from "@/app/page.module.css";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { currentTrack, isPlaying } = useSelector((state: RootState) => state.player);
  
  const shouldShowPlayer = currentTrack !== null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {children}
        
        {shouldShowPlayer && (
          <div className={styles.bar}>
            <div className={styles.bar__content}>
              <div className={styles.bar__playerBlock}>
                <div className={styles.bar__player}>
                  <div className={styles.trackPlay}>
                    <div className={styles.trackPlay__contain}>
                      <div className={styles.trackPlay__image}>
                        <svg className={styles.trackPlay__svg}>
                          <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
                        </svg>
                        {isPlaying && (
                          <div className={styles.track__titleDot}></div>
                        )}
                      </div>
                      <div className={styles.trackPlay__author}>
                        <span 
                          className={styles.trackPlay__authorLink} 
                          title={currentTrack?.name}
                        >
                          {currentTrack?.name || "Трек не выбран"}
                        </span>
                      </div>
                      <div className={styles.trackPlay__album}>
                        <span 
                          className={styles.trackPlay__albumLink} 
                          title={currentTrack?.author}
                        >
                          {currentTrack?.author || "Исполнитель не выбран"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <footer className={styles.footer}></footer>
      </div>
      <AudioManager />
    </div>
  );
}