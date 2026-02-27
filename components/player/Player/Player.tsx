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
  updateTrackDuration,
} from "@/store/slices/playerSlice";
import { RootState } from "@/store/store";
import styles from "./Player.module.css";

const Player = memo(function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useDispatch();
  const playerState = useSelector((state: RootState) => state.player);
  const { currentTrack, isPlaying, volume, repeat, shuffle, currentTime, duration } = playerState;

  const lastTimeRef = useRef<number>(0);
  const stallCheckIntervalRef = useRef<NodeJS.Timeout>();

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
    if (!audio || !currentTrack?.track_file) return;

    const loadAndPlay = async () => {
      try {
        if (audio.src !== currentTrack.track_file) {
          audio.src = currentTrack.track_file!;
          audio.load();
          await new Promise((resolve) => {
            const onCanPlay = () => {
              audio.removeEventListener('canplay', onCanPlay);
              resolve(null);
            };
            audio.addEventListener('canplay', onCanPlay, { once: true });
          });
        }

        if (isPlaying) {
          await audio.play();
        } else {
          audio.pause();
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
        } else {
          console.error('Ошибка воспроизведения:', error);
          dispatch(setNextTrack());
        }
      }
    };

    loadAndPlay();
  }, [currentTrack, isPlaying, dispatch]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      dispatch(setCurrentTime(audio.currentTime));
    }
  }, [dispatch]);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      const realDuration = audio.duration;
      dispatch(setDuration(realDuration));
      if (currentTrack) {
        dispatch(updateTrackDuration({ id: currentTrack.id, duration: realDuration }));
      }
    }
  }, [dispatch, currentTrack]);

  const handleEnded = useCallback(() => {
    console.log('✅ Трек закончился (событие ended)');
    if (repeat) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      }
    } else {
      dispatch(setNextTrack());
    }
  }, [repeat, dispatch]);

  const handleError = useCallback(() => {
    console.error('❌ Ошибка аудио, переключаем трек');
    dispatch(setNextTrack());
  }, [dispatch]);

  const handleStalled = useCallback(() => {
    console.log('⚠️ Загрузка остановилась (stalled), возможно, конец потока');
    if (isPlaying) {
      dispatch(setNextTrack());
    }
  }, [isPlaying, dispatch]);

  useEffect(() => {
    if (!isPlaying) {
      if (stallCheckIntervalRef.current) {
        clearInterval(stallCheckIntervalRef.current);
      }
      return;
    }

    stallCheckIntervalRef.current = setInterval(() => {
      const audio = audioRef.current;
      if (!audio || audio.ended) return;

      const current = audio.currentTime;
      if (current === lastTimeRef.current) {
        setTimeout(() => {
          if (audio.currentTime === lastTimeRef.current && isPlaying) {
            console.log('⚠️ Трек завис, принудительное переключение');
            dispatch(setNextTrack());
          }
        }, 2000);
      } else {
        lastTimeRef.current = current;
      }
    }, 3000);

    return () => {
      if (stallCheckIntervalRef.current) {
        clearInterval(stallCheckIntervalRef.current);
      }
    };
  }, [isPlaying, dispatch]);

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
          onStalled={handleStalled}
          preload="metadata"
        />
      )}
    </>
  );
});

export default Player;