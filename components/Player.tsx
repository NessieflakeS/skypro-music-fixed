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
  setNextTrack
} from "../store/playerSlice";
import { RootState } from "../store/store";
import styles from "./Player.module.css";
import { data } from "../data";

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useDispatch();
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    shuffle, 
    repeat,
    currentTime,
    duration 
  } = useSelector((state: RootState) => state.player);

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
      }
    } else {
      handleNextTrack();
    }
  };

  const getNextTrack = () => {
    if (!currentTrack) return null;
    
    const currentIndex = data.findIndex(track => track._id === currentTrack.id);
    if (currentIndex === -1) return null;
    
    if (shuffle) {
      // Случайный трек, исключая текущий
      const availableTracks = data.filter(track => track._id !== currentTrack.id);
      if (availableTracks.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * availableTracks.length);
      return availableTracks[randomIndex];
    } else {
      const nextIndex = (currentIndex + 1) % data.length;
      return data[nextIndex];
    }
  };

  const getPrevTrack = () => {
    if (!currentTrack) return null;
    
    const currentIndex = data.findIndex(track => track._id === currentTrack.id);
    if (currentIndex === -1) return null;
    
    if (shuffle) {
      const availableTracks = data.filter(track => track._id !== currentTrack.id);
      if (availableTracks.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * availableTracks.length);
      return availableTracks[randomIndex];
    } else {
      const prevIndex = (currentIndex - 1 + data.length) % data.length;
      return data[prevIndex];
    }
  };

  const handleNextTrack = () => {
    const nextTrack = getNextTrack();
    if (nextTrack) {
      dispatch(setNextTrack({
        id: nextTrack._id,
        name: nextTrack.name,
        author: nextTrack.author,
        album: nextTrack.album,
        time: `${Math.floor(nextTrack.duration_in_seconds / 60)}:${(nextTrack.duration_in_seconds % 60).toString().padStart(2, '0')}`,
        track_file: nextTrack.track_file
      }));
    }
  };

  const handlePrevTrack = () => {
    const prevTrack = getPrevTrack();
    if (prevTrack) {
      dispatch(setNextTrack({
        id: prevTrack._id,
        name: prevTrack.name,
        author: prevTrack.author,
        album: prevTrack.album,
        time: `${Math.floor(prevTrack.duration_in_seconds / 60)}:${(prevTrack.duration_in_seconds % 60).toString().padStart(2, '0')}`,
        track_file: prevTrack.track_file
      }));
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current && currentTrack?.track_file) {
      audioRef.current.src = currentTrack.track_file;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack?.id, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    dispatch(togglePlayPause());
  };

  const handlePrevClick = () => {
    handlePrevTrack();
  };

  const handleNextClick = () => {
    handleNextTrack();
  };

  const handleRepeatClick = () => {
    dispatch(toggleRepeat());
  };

  const handleShuffleClick = () => {
    dispatch(toggleShuffle());
  };

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
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          loop={repeat}
        />
      )}
    </>
  );
}