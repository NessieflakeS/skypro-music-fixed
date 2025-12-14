"use client";

import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  togglePlayPause, 
  toggleShuffle, 
  toggleRepeat, 
  setVolume,
  setCurrentTime,
  setDuration,
  setNextTrack,
  setPrevTrack
} from "@/store/playerSlice";
import { RootState } from "@/store/store";
import styles from "./Player.module.css";

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useDispatch();
  const playerState = useSelector((state: RootState) => state.player);
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    shuffle, 
    repeat,
    currentTime,
    duration 
  } = playerState;

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      dispatch(setCurrentTime(audioRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      dispatch(setDuration(audioRef.current.duration));
    }
  };

  const handleEnded = () => {
    if (repeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        dispatch(setCurrentTime(0));
      }
    } else {
      dispatch(setNextTrack());
    }
  };

  const handlePlayPause = () => {
    dispatch(togglePlayPause());
  };

  const handlePrevClick = () => {
    dispatch(setPrevTrack());
  };

  const handleNextClick = () => {
    dispatch(setNextTrack());
  };

  const handleRepeatClick = () => {
    dispatch(toggleRepeat());
  };

  const handleShuffleClick = () => {
    dispatch(toggleShuffle());
  };

  useEffect(() => {
    if (audioRef.current && currentTrack?.track_file) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Ошибка воспроизведения трека:", error);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current && currentTrack?.track_file) {
      audioRef.current.src = currentTrack.track_file;
      audioRef.current.load();
      dispatch(setCurrentTime(0));
      
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Ошибка загрузки трека:", error);
          });
        }
      }
    }
  }, [currentTrack?.id, dispatch, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <>
      <div className={styles.player}>
        <div className={styles.player__controls}>
          <div 
            className={styles.player__btnPrev} 
            aria-label="Предыдущий трек"
            onClick={handlePrevClick}
          >
            <svg className={styles.player__btnPrevSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-prev"></use>
            </svg>
          </div>
          <div 
            className={styles.player__btnPlay} 
            aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
            onClick={handlePlayPause}
          >
            <svg className={styles.player__btnPlaySvg}>
              {isPlaying ? (
                <use xlinkHref="/img/icon/sprite.svg#icon-pause"></use>
              ) : (
                <use xlinkHref="/img/icon/sprite.svg#icon-play"></use>
              )}
            </svg>
          </div>
          <div 
            className={styles.player__btnNext} 
            aria-label="Следующий трек"
            onClick={handleNextClick}
          >
            <svg className={styles.player__btnNextSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-next"></use>
            </svg>
          </div>
          <div 
            className={`${styles.player__btnRepeat} ${repeat ? styles.player__btnRepeat_active : ''}`} 
            aria-label="Повтор"
            onClick={handleRepeatClick}
          >
            <svg className={styles.player__btnRepeatSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-repeat"></use>
            </svg>
          </div>
          <div 
            className={`${styles.player__btnShuffle} ${shuffle ? styles.player__btnShuffle_active : ''}`} 
            aria-label="Перемешать"
            onClick={handleShuffleClick}
          >
            <svg className={styles.player__btnShuffleSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-shuffle"></use>
            </svg>
          </div>
        </div>
      </div>
      
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.track_file}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          loop={repeat}
          preload="metadata"
        />
      )}
    </>
  );
}