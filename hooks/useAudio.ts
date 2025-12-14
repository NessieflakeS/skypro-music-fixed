import { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentTime, setDuration } from '@/store/playerSlice';

export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useDispatch();

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

  return {
    audioRef,
    handleTimeUpdate,
    handleLoadedMetadata
  };
};