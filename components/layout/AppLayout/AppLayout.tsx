"use client";

import { ReactNode, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Player from "@/components/player/Player/Player";
import LikeButton from "@/components/ui/LikeButton/LikeButton";
import { RootState } from "@/store/store";
import { setCurrentTime, setVolume } from "@/store/slices/playerSlice";
import { toggleFavoriteTrack } from "@/store/slices/userSlice";
import styles from "./AppLayout.module.css";
import { formatTime } from "@/utils/formatTime";
import AuthInitializer from "@/components/providers/AuthInitializer/AuthInitializer";
import ProgressBar from "@/components/player/ProgressBar/ProgressBar";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const dispatch = useDispatch();
  const playerState = useSelector((state: RootState) => state.player);
  const userState = useSelector((state: RootState) => state.user);
  const { currentTrack, currentTime, duration, volume } = playerState;
  const { isAuthenticated } = userState;

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    dispatch(setVolume(newVolume));
  }, [dispatch]);

  const handleSeek = useCallback((newTime: number) => {
    dispatch(setCurrentTime(newTime));
  }, [dispatch]);

  const isTrackLiked = useMemo(() => {
    if (!currentTrack || !isAuthenticated) return false;
    return userState.favoriteTracks.includes(currentTrack.id);
  }, [currentTrack, isAuthenticated, userState.favoriteTracks]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {children}
        {currentTrack && (
          <div className={styles.bar}>
            <div className={styles.bar__content}>
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
              />
              <div className={styles.bar__playerBlock}>
                <div className={styles.bar__player}>
                  <Player />
                  <div className={styles.trackPlay}>
                    <div className={styles.trackPlay__contain}>
                      <div className={styles.trackPlay__image}>
                        <svg className={styles.trackPlay__svg}>
                          <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
                        </svg>
                      </div>
                      <div className={styles.trackPlay__author}>
                        <span>{currentTrack.name}</span>
                      </div>
                      <div className={styles.trackPlay__album}>
                        <span>{currentTrack.author}</span>
                      </div>
                    </div>
                    <div className={styles.trackPlay__likeDis}>
                      <LikeButton
                        trackId={currentTrack.id}
                        size="medium"
                        showCount={false}
                        initialLiked={isTrackLiked}
                      />
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
    </div>
  );
}