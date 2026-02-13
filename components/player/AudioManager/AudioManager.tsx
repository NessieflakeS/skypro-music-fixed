"use client";

import { useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setCurrentTime, setDuration, setNextTrack } from "@/store/slices/playerSlice";

export default function AudioManager() {
  const dispatch = useDispatch();
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentTrack, isPlaying, volume, repeat } = useSelector((state: RootState) => state.player);
  const isInitializedRef = useRef(false);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
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
    if (repeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    } else {
      dispatch(setNextTrack());
    }
  }, [repeat, dispatch]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isInitializedRef.current) return;

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    isInitializedRef.current = true;

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [handleTimeUpdate, handleLoadedMetadata, handleEnded]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.track_file) return;

    const playTrack = async () => {
      try {
        if (isPlaying) {
          await audio.play();
        } else {
          audio.pause();
        }
      } catch (error) {
        console.error("Ошибка воспроизведения:", error);
      }
    };

    const isNewTrack = !audio.src || audio.src !== currentTrack.track_file;
    
    if (isNewTrack) {
      audio.pause();
      audio.src = currentTrack.track_file;
      audio.load();
      
      const playWhenReady = () => {
        if (isPlaying) {
          audio.play().catch(e => {
            console.log("Трек еще не готов, ждем...");
            setTimeout(() => {
              if (isPlaying) {
                audio.play().catch(console.error);
              }
            }, 100);
          });
        }
      };
      
      audio.addEventListener('loadedmetadata', playWhenReady, { once: true });
      
      if (audio.readyState >= 1) {
        playWhenReady();
      }
    } else {
      playTrack();
    }

  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const { currentTime } = useSelector((state: RootState) => state.player);
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && Math.abs(audio.currentTime - currentTime) > 0.1) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  return <audio ref={audioRef} preload="metadata" />;
}