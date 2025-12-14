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
    const audio = audioRef.current;
    if (audio) {
      dispatch(setCurrentTime(audio.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) {
      dispatch(setDuration(audio.duration));
    }
  };

  const handleEnded = () => {
    const audio = audioRef.current;
    if (repeat) {
      if (audio) {
        audio.currentTime = 0;
        dispatch(setCurrentTime(0));
        audio.play();
      }
    } else {
      dispatch(setNextTrack());
    }
  };

  const handleError = (e: any) => {
    console.error("Ошибка воспроизведения аудио:", e);
  };

  const handlePlayPause = () => {
    if (!currentTrack) return;
    
    const audio = audioRef.current;
    if (audio && audio.ended) {
      audio.currentTime = 0;
      dispatch(setCurrentTime(0));
    }
    
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
    const audio = audioRef.current;
    if (!audio || !currentTrack?.track_file) return;

    const playAudio = async () => {
      if (isPlaying) {
        try {
          await audio.play();
        } catch (error) {
          console.error("Ошибка воспроизведения:", error);
        }
      } else {
        audio.pause();
      }
    };

    playAudio();
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.track_file) return;

    const loadTrack = async () => {
      try {
        audio.pause();
        
        audio.src = currentTrack.track_file!;
        
        dispatch(setCurrentTime(0));
        
        await new Promise<void>((resolve, reject) => {
          const handleCanPlay = () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleErrorCallback);
            resolve();
          };
          
          const handleErrorCallback = (e: Event) => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleErrorCallback);
            reject(e);
          };
          
          audio.addEventListener('canplay', handleCanPlay);
          audio.addEventListener('error', handleErrorCallback);
          
          audio.load();
        });
        
        if (isPlaying) {
          await audio.play();
        }
      } catch (error) {
        console.error("Ошибка загрузки трека:", error);
      }
    };

    loadTrack();
  }, [currentTrack?.id, dispatch, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
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
          onError={handleError}
          loop={repeat}
          preload="metadata"
        />
      )}
    </>
  );
}