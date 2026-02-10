"use client";

import { ReactNode, useEffect, useRef, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import AudioManager from "@/components/AudioManager";
import LikeButton from "@/components/LikeButton";
import { RootState } from "@/store/store";
import { 
  togglePlayPause, 
  setVolume, 
  toggleShuffle, 
  toggleRepeat,
  setCurrentTime,
  setNextTrack,
  setPrevTrack 
} from "@/store/playerSlice";
import styles from "@/app/page.module.css";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const dispatch = useDispatch();
  const playerState = useSelector((state: RootState) => state.player);
  const { currentTrack, isPlaying, volume, shuffle, repeat, currentTime, duration } = playerState;
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  useEffect(() => {
    if (progressBarRef.current && duration > 0) {
      const progressPercentage = (currentTime / duration) * 100;
      progressBarRef.current.style.setProperty('--progress', `${progressPercentage}%`);
    }
  }, [currentTime, duration]);
  
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const progressBarWidth = rect.width;
    const percentage = (clickPosition / progressBarWidth) * 100;
    const newTime = (percentage / 100) * duration;
    
    dispatch(setCurrentTime(newTime));
  }, [dispatch, duration]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    dispatch(setVolume(newVolume));
  }, [dispatch]);

  const formattedCurrentTime = useMemo(() => 
    formatTime(currentTime),
    [currentTime, formatTime]
  );

  const formattedDuration = useMemo(() => 
    formatTime(duration),
    [duration, formatTime]
  );

  const shouldShowPlayer = useMemo(() => 
    currentTrack !== null,
    [currentTrack]
  );

  const handlePlayPause = useCallback(() => {
    dispatch(togglePlayPause());
  }, [dispatch]);

  const handleNextTrack = useCallback(() => {
    dispatch(setNextTrack());
  }, [dispatch]);

  const handlePrevTrack = useCallback(() => {
    dispatch(setPrevTrack());
  }, [dispatch]);

  const handleToggleRepeat = useCallback(() => {
    dispatch(toggleRepeat());
  }, [dispatch]);

  const handleToggleShuffle = useCallback(() => {
    dispatch(toggleShuffle());
  }, [dispatch]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {children}
        
        {shouldShowPlayer && (
          <div className={styles.bar}>
            <div className={styles.bar__content}>
              {/* Прогресс-бар */}
              <div className={styles.progressContainer}>
                <div className={styles.timeDisplay}>{formattedCurrentTime}</div>
                <div 
                  className={styles.bar__playerProgress} 
                  ref={progressBarRef}
                  onClick={handleProgressClick}
                ></div>
                <div className={styles.timeDisplay}>{formattedDuration}</div>
              </div>
              
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
                    
                    <div className={styles.trackPlay__likeDis}>
                      {currentTrack && (
                        <LikeButton 
                          trackId={currentTrack.id} 
                          size="small"
                          showCount={false}
                        />
                      )}
                    </div>
                    
                    <div className={styles.player__controls}>
                      <button 
                        onClick={handlePrevTrack}
                        className={styles.player__btnPrev}
                        aria-label="Предыдущий трек"
                      >
                        <svg className={styles.player__btnPrevSvg}>
                          <use xlinkHref="/img/icon/sprite.svg#icon-prev"></use>
                        </svg>
                      </button>
                      
                      <button 
                        onClick={handlePlayPause}
                        className={styles.player__btnPlay}
                        aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
                      >
                        <svg className={styles.player__btnPlaySvg}>
                          {isPlaying ? (
                            <use xlinkHref="/img/icon/sprite.svg#icon-pause"></use>
                          ) : (
                            <use xlinkHref="/img/icon/sprite.svg#icon-play"></use>
                          )}
                        </svg>
                      </button>
                      
                      <button 
                        onClick={handleNextTrack}
                        className={styles.player__btnNext}
                        aria-label="Следующий трек"
                      >
                        <svg className={styles.player__btnNextSvg}>
                          <use xlinkHref="/img/icon/sprite.svg#icon-next"></use>
                        </svg>
                      </button>
                      
                      <button 
                        onClick={handleToggleRepeat}
                        className={`${styles.player__btnRepeat} ${repeat ? styles.player__btnRepeat_active : ''}`}
                        aria-label="Повтор"
                      >
                        <svg className={styles.player__btnRepeatSvg}>
                          <use xlinkHref="/img/icon/sprite.svg#icon-repeat"></use>
                        </svg>
                      </button>
                      
                      <button 
                        onClick={handleToggleShuffle}
                        className={`${styles.player__btnShuffle} ${shuffle ? styles.player__btnShuffle_active : ''}`}
                        aria-label="Перемешать"
                      >
                        <svg className={styles.player__btnShuffleSvg}>
                          <use xlinkHref="/img/icon/sprite.svg#icon-shuffle"></use>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className={styles.bar__volumeBlock}>
                  <div className={styles.volume__content}>
                    <div className={styles.volume__image}>
                      <svg className={styles.volume__svg}>
                        <use xlinkHref="/img/icon/sprite.svg#icon-volume"></use>
                      </svg>
                    </div>
                    <div className={styles.volume__progress}>
                      <input
                        className={styles.volume__progressLine}
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        aria-label="Громкость"
                      />
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