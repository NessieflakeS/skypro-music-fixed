"use client";

import axios from 'axios';
import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toggleFavoriteTrack } from '@/store/slices/userSlice';
import { trackService } from '@/services/trackService';
import styles from './LikeButton.module.css';

interface LikeButtonProps {
  trackId: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  initialLiked?: boolean;
  likeCount?: number;
  onToggle?: (trackId: number, newLikedState: boolean) => void;
}

const LikeButton = memo(function LikeButton({ 
  trackId, 
  size = 'medium', 
  showCount = false,
  initialLiked = false,
  likeCount = 0,
  onToggle
}: LikeButtonProps) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const favoriteTracks = useSelector((state: RootState) => state.user.favoriteTracks);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [animationClass, setAnimationClass] = useState('');
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  
  const isLiked = useMemo(() => 
    favoriteTracks.includes(trackId) || initialLiked,
    [favoriteTracks, trackId, initialLiked]
  );
  
  const updateTooltipPosition = useCallback(() => {
    if (buttonRef.current && error) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + window.scrollY - 40, 
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  }, [error]);
  
  useEffect(() => {
    if (error) {
      updateTooltipPosition();
      
      const handleScroll = () => updateTooltipPosition();
      const handleResize = () => updateTooltipPosition();
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    } else {
      setTooltipPosition(null);
    }
  }, [error, updateTooltipPosition]);
  
  const handleLike = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Войдите в аккаунт, чтобы ставить лайки');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newLikedState = !isLiked;

      dispatch(toggleFavoriteTrack(trackId));
      if (onToggle) onToggle(trackId, newLikedState);
      setLocalLikeCount((prev) => (newLikedState ? prev + 1 : Math.max(0, prev - 1)));
      setAnimationClass(styles.pulse);
      setTimeout(() => setAnimationClass(''), 500);

      await trackService.toggleLike(trackId, isLiked);
    } catch (err: unknown) {
      dispatch(toggleFavoriteTrack(trackId));
      setLocalLikeCount((prev) => (isLiked ? prev + 1 : Math.max(0, prev - 1)));

      let errorMessage = 'Ошибка при обновлении лайка';
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          errorMessage = 'Сессия истекла. Пожалуйста, войдите снова.';
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('Like error:', err);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [trackId, isLiked, isAuthenticated, dispatch, onToggle]);
  
  const buttonClasses = useMemo(() => {
    const baseClass = styles.likeButton;
    const sizeClass = styles[size];
    const likedClass = isLiked ? styles.liked : '';
    return `${baseClass} ${sizeClass} ${likedClass} ${animationClass}`;
  }, [size, isLiked, animationClass]);
  
  return (
    <div className={styles.container}>
      <button
        ref={buttonRef}
        className={buttonClasses}
        onClick={handleLike}
        disabled={isLoading}
        aria-label={isLiked ? 'Убрать лайк' : 'Поставить лайк'}
        title={isLiked ? 'Убрать лайк' : 'Поставить лайк'}
      >
        <svg 
          className={styles.icon} 
          viewBox="0 0 24 24"
          fill={isLiked ? "#ad61ff" : "none"}
          stroke={isLiked ? "#ad61ff" : "#696969"}
          strokeWidth="2"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        {showCount && localLikeCount > 0 && (
          <span className={styles.count}>{localLikeCount}</span>
        )}
      </button>
      
      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      )}
      
      {error && tooltipPosition && typeof window !== 'undefined' && createPortal(
        <div 
          className={styles.errorTooltip}
          style={{
            '--tooltip-top': `${tooltipPosition.top}px`,
            '--tooltip-left': `${tooltipPosition.left}px`,
          } as React.CSSProperties}
        >
          {error}
          <div className={styles.errorTooltipArrow} />
        </div>,
        document.body
      )}
    </div>
  );
});

export default LikeButton;