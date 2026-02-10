"use client";

import { useState, useCallback, useMemo, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toggleFavoriteTrack } from '@/store/userSlice';
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
  
  const isLiked = useMemo(() => 
    favoriteTracks.includes(trackId) || initialLiked,
    [favoriteTracks, trackId, initialLiked]
  );
  
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
      
      if (onToggle) {
        onToggle(trackId, newLikedState);
      }
      
      setLocalLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
      
      setAnimationClass(styles.pulse);
      setTimeout(() => setAnimationClass(''), 500);
      
      await trackService.toggleLike(trackId, isLiked);
      
    } catch (err: any) {
      dispatch(toggleFavoriteTrack(trackId));
      setLocalLikeCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1));
      
      const errorMessage = err.response?.status === 401 
        ? 'Сессия истекла. Пожалуйста, войдите снова.' 
        : err.message || 'Ошибка при обновлении лайка';
      
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
      
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
      
      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </div>
  );
});

export default LikeButton;