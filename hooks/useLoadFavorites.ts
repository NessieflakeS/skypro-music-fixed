import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setFavoriteTracks } from '@/store/slices/userSlice';
import { trackService } from '@/services/trackService';

export const useLoadFavorites = () => {
  const dispatch = useDispatch();

  const loadFavorites = useCallback(async () => {
    try {
      console.log('Загрузка избранных треков...');
      const favoriteTracks = await trackService.getFavoriteTracks();
      const trackIds = favoriteTracks.map((track) => track.id || track._id || 0);
      dispatch(setFavoriteTracks(trackIds));
      console.log(`Избранные треки загружены: ${trackIds.length}`);
      return trackIds;
    } catch (error) {
      console.error('Ошибка загрузки избранных треков:', error);
      dispatch(setFavoriteTracks([]));
      return [];
    }
  }, [dispatch]);

  return loadFavorites;
};