"use client";

import { useRef, useEffect, useCallback, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  togglePlayPause,
  toggleShuffle,
  toggleRepeat,
  setNextTrack,
  setPrevTrack,
  setCurrentTime,
  setDuration,
} from "@/store/slices/playerSlice";
import { RootState } from "@/store/store";
import styles from "./Player.module.css";

const Player = memo(function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useDispatch();
  const playerState = useSelector((state: RootState) => state.player);
  const { currentTrack, isPlaying, volume, repeat, shuffle, currentTime, duration } = playerState;

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && Math.abs(audio.currentTime - currentTime) > 0.1) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    const trackFile = currentTrack?.track_file;
    if (!audio || !trackFile) return;

    const loadAndPlay = async () => {
      try {
        if (audio.src !== trackFile) {
          audio.src = trackFile;
          audio.load();
          await new Promise<void>((resolve) => {
            const onLoaded = () => {
              audio.removeEventListener('loadedmetadata', onLoaded);
              resolve();
            };
            audio.addEventListener('loadedmetadata', onLoaded, { once: true });
          });
        }

        if (isPlaying) {
          await audio.play();
        } else {
          audio.pause();
        }
      } catch (error) {
        console.error('Ошибка воспроизведения:', error);
      }
    };

    loadAndPlay();
  }, [currentTrack, isPlaying]);

  const handleTimeUpdate = useCallback(() => {
  const audio = audioRef.current;
  if (audio) {
    console.log('⏱️ время:', audio.currentTime, 'длит:', audio.duration);
    dispatch(setCurrentTime(audio.currentTime));
  }
}, [dispatch]);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      dispatch(setDuration(audio.duration));
    }
  }, [dispatch]);

  const handleEnded = useCallback(() => {
      console.log('🔥 Трек закончился! repeat =', repeat);
      console.log('Текущее время:', audioRef.current?.currentTime, 'длительность:', audioRef.current?.duration);
    if (repeat) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      }
    } else {
      console.log('➡️ Вызываем setNextTrack');
      dispatch(setNextTrack());
    }
  }, [repeat, dispatch]);

  const handleError = useCallback(() => {
    const error = audioRef.current?.error;
    console.error('Ошибка аудио:', error);
    dispatch(setNextTrack());
  }, [dispatch]);

  const handlePlayPause = useCallback(() => {
    if (!currentTrack) return;
    dispatch(togglePlayPause());
  }, [currentTrack, dispatch]);

  const handlePrevClick = useCallback(() => dispatch(setPrevTrack()), [dispatch]);
  const handleNextClick = useCallback(() => dispatch(setNextTrack()), [dispatch]);
  const handleRepeatClick = useCallback(() => dispatch(toggleRepeat()), [dispatch]);
  const handleShuffleClick = useCallback(() => dispatch(toggleShuffle()), [dispatch]);

  return (
    <>
      <div className={styles.player}>
        <div className={styles.player__controls}>
          <div className={styles.player__btnPrev} onClick={handlePrevClick}>
            <svg className={styles.player__btnPrevSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-prev" />
            </svg>
          </div>
          <div className={styles.player__btnPlay} onClick={handlePlayPause}>
            <svg className={styles.player__btnPlaySvg}>
              <use xlinkHref={isPlaying ? "/img/icon/sprite.svg#icon-pause" : "/img/icon/sprite.svg#icon-play"} />
            </svg>
          </div>
          <div className={styles.player__btnNext} onClick={handleNextClick}>
            <svg className={styles.player__btnNextSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-next" />
            </svg>
          </div>
          <div
            className={`${styles.player__btnRepeat} ${repeat ? styles.player__btnRepeat_active : ''}`}
            onClick={handleRepeatClick}
          >
            <svg className={styles.player__btnRepeatSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-repeat" />
            </svg>
          </div>
          <div
            className={`${styles.player__btnShuffle} ${shuffle ? styles.player__btnShuffle_active : ''}`}
            onClick={handleShuffleClick}
          >
            <svg className={styles.player__btnShuffleSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-shuffle" />
            </svg>
          </div>
        </div>
      </div>

      {currentTrack && currentTrack.track_file && (
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={handleError}
          preload="metadata"
        />
      )}
    </>
  );
});

export default Player;