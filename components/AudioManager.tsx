"use client";

import { useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setCurrentTime, setDuration, setNextTrack, togglePlayPause } from "@/store/playerSlice";

export default function AudioManager() {
  const dispatch = useDispatch();
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentTrack, isPlaying, volume, repeat, currentTime } = useSelector((state: RootState) => state.player);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      dispatch(setCurrentTime(audioRef.current.currentTime));
    }
  }, [dispatch]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      dispatch(setDuration(audioRef.current.duration));
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

  const handleError = useCallback((error: Event) => {
    console.error("Ошибка воспроизведения аудио:", error);
    dispatch(togglePlayPause());
  }, [dispatch]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [handleTimeUpdate, handleLoadedMetadata, handleEnded, handleError]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.track_file) {
      const isNewTrack = audio.src !== currentTrack.track_file;
      
      if (isNewTrack) {
        audio.src = currentTrack.track_file;
        audio.load();
      }
      
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Ошибка при попытке воспроизведения:", error);
            dispatch(togglePlayPause());
          });
        }
      } else {
        audio.pause();
      }
    }
  }, [currentTrack, isPlaying, dispatch]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack && Math.abs(audio.currentTime - currentTime) > 0.1) {
      audio.currentTime = currentTime;
    }
  }, [currentTime, currentTrack]);

  return <audio ref={audioRef} preload="metadata" />;
}