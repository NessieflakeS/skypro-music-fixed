import axios from 'axios';
import { Track, Selection } from '@/types';
import { apiClient } from './apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://webdev-music-003b5b991590.herokuapp.com';

const TRACK_CACHE: {
  allTracks: Track[] | null;
  allTracksTimestamp: number | null;
  selections: Map<number, { data: Track[]; timestamp: number }>;
} = {
  allTracks: null,
  allTracksTimestamp: null,
  selections: new Map(),
};

const CACHE_DURATION = 5 * 60 * 1000;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const protectedEndpoints = [
    '/catalog/track/favorite/all/',
    '/catalog/track/:id/favorite/'
  ];
  
  const isProtected = protectedEndpoints.some(endpoint => 
    config.url?.includes(endpoint.replace('/:id/', ''))
  );
  
  if (typeof window !== 'undefined' && isProtected) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post<{ access: string }>(`${API_URL}/user/token/refresh/`, {
            refresh: refreshToken
          });
          
          const newAccessToken = response.data.access;
          localStorage.setItem('token', newAccessToken);
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/signin';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

const normalizeTrack = (item: any, index: number): Track => ({
  id: item.id || item._id || index + 1,
  name: item.name || item.title || `Трек ${index + 1}`,
  author: item.author || item.artist || 'Неизвестный исполнитель',
  album: item.album || 'Без альбома',
  duration_in_seconds: item.duration_in_seconds || item.duration || 180,
  track_file: item.track_file || item.audio_file || item.url || '',
  release_date: item.release_date || '2023-01-01',
  genre: Array.isArray(item.genre) ? item.genre : 
         (item.genre ? [item.genre] : ['Не указан']),
  logo: item.logo || null,
  stared_user: item.stared_user || []
});

const extractTracksFromResponse = (data: any): any[] => {
  if (data?.success && Array.isArray(data.data)) {
    return data.data;
  } else if (Array.isArray(data)) {
    return data;
  }
  return [];
};

export const trackService = {
  getAllTracks: async (forceRefresh = false): Promise<Track[]> => {
    try {
      const now = Date.now();
      
      if (!forceRefresh && 
          TRACK_CACHE.allTracks && 
          TRACK_CACHE.allTracksTimestamp && 
          (now - TRACK_CACHE.allTracksTimestamp) < CACHE_DURATION) {
        console.log('[API] Используем кэшированные треки');
        return TRACK_CACHE.allTracks;
      }

      console.log('[API] Запрашиваем все треки...');
      const response = await apiClient.get('/catalog/track/all/');
      
      const rawTracks = extractTracksFromResponse(response.data);
      console.log(`[API] Найдено ${rawTracks.length} треков`);

      const normalizedTracks = rawTracks.map(normalizeTrack);

      console.log(`[API] Нормализовано треков: ${normalizedTracks.length}`);
      
      TRACK_CACHE.allTracks = normalizedTracks;
      TRACK_CACHE.allTracksTimestamp = now;
      
      return normalizedTracks;
    } catch (error: any) {
      console.error('[API] Ошибка получения всех треков:', error);
      
      if (TRACK_CACHE.allTracks) {
        console.log('[API] Используем кэш из-за ошибки');
        return TRACK_CACHE.allTracks;
      }
      
      throw new Error('Не удалось загрузить треки');
    }
  },

  getSelectionTracks: async (selectionId: number, forceRefresh = false): Promise<Track[]> => {
    try {
      const now = Date.now();
      const cachedSelection = TRACK_CACHE.selections.get(selectionId);
      
      if (!forceRefresh && cachedSelection) {
        const isCacheValid = (now - cachedSelection.timestamp) < CACHE_DURATION;
        if (isCacheValid) {
          console.log(`[API] Используем кэшированную подборку #${selectionId}`);
          return cachedSelection.data;
        }
      }

      console.log(`[API] Запрашиваем подборку #${selectionId}...`);
      const response = await apiClient.get(`/catalog/selection/${selectionId}/`);
      
      if (response.data?.data === null) {
        console.log(`[API] Подборка #${selectionId} пуста`);
        TRACK_CACHE.selections.set(selectionId, { data: [], timestamp: now });
        return [];
      }

      const selectionData = response.data?.data;
      const itemIds: number[] = selectionData?.items || [];
      
      console.log(`[API] Подборка "${selectionData?.name || 'Без названия'}" содержит ${itemIds.length} ID треков`);
      
      if (itemIds.length === 0) {
        console.warn(`[API] Подборка #${selectionId} не содержит ID треков`);
        TRACK_CACHE.selections.set(selectionId, { data: [], timestamp: now });
        return [];
      }

      const allTracks = TRACK_CACHE.allTracks || await trackService.getAllTracks();
      console.log(`[API] Получено ${allTracks.length} треков`);

      const tracksForSelection = allTracks.filter(track => itemIds.includes(track.id));
      console.log(`[API] Для подборки #${selectionId} найдено ${tracksForSelection.length} треков`);
      
      TRACK_CACHE.selections.set(selectionId, { 
        data: tracksForSelection, 
        timestamp: now 
      });

      return tracksForSelection;

    } catch (error: any) {
      console.error(`[API] Ошибка загрузки подборки ${selectionId}:`, error);
      
      const cachedSelection = TRACK_CACHE.selections.get(selectionId);
      if (cachedSelection) {
        console.log(`[API] Используем кэшированную подборку #${selectionId} из-за ошибки`);
        return cachedSelection.data;
      }
      
      if (error.response?.status === 404) {
        throw new Error(`Подборка ${selectionId} не найдена`);
      }
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Сервер временно недоступен');
      }
      
      throw new Error(`Ошибка загрузки подборки: ${error.message}`);
    }
  },

  getAllSelections: async (): Promise<Selection[]> => {
    try {
      console.log('[API] Запрашиваем все подборки...');
      const response = await api.get('/catalog/selection/all/');
      
      const selectionsData = response.data?.success ? response.data.data : response.data;
      const selectionsArray = Array.isArray(selectionsData) ? selectionsData : [];
      
      const selections: Selection[] = selectionsArray.map((selection: any) => ({
        id: selection.id || selection._id || 0,
        name: selection.name || `Подборка`,
        items: selection.items || [],
        tracks: selection.tracks || []
      }));
      
      console.log(`[API] Получено ${selections.length} подборок`);
      return selections;
    } catch (error: any) {
      console.error('[API] Ошибка получения подборок:', error);
      return [];
    }
  },

  getSelectionInfo: async (selectionId: number): Promise<Selection | null> => {
    try {
      console.log(`[API] Запрашиваем информацию о подборке ${selectionId}...`);
      const response = await api.get(`/catalog/selection/${selectionId}/`);
      
      const selectionData = response.data?.success ? response.data.data : response.data;
      
      if (selectionData) {
        return {
          id: selectionData.id || selectionData._id || selectionId,
          name: selectionData.name || `Подборка ${selectionId}`,
          items: selectionData.items || [],
          tracks: selectionData.tracks || []
        };
      }
      
      return null;
    } catch (error) {
      console.error(`[API] Ошибка получения информации о подборке ${selectionId}:`, error);
      return null;
    }
  },

  likeTrack: async (trackId: number): Promise<void> => {
    try {
      await api.post(`/catalog/track/${trackId}/favorite/`);
      console.log(`[API] Трек ${trackId} добавлен в избранное`);
      
      TRACK_CACHE.selections.delete(-1); 
    } catch (error) {
      console.error('[API] Ошибка добавления в избранное:', error);
      throw error;
    }
  },

  dislikeTrack: async (trackId: number): Promise<void> => {
    try {
      await api.delete(`/catalog/track/${trackId}/favorite/`);
      console.log(`[API] Трек ${trackId} удален из избранного`);
      
      TRACK_CACHE.selections.delete(-1);
    } catch (error) {
      console.error('[API] Ошибка удаления из избранного:', error);
      throw error;
    }
  },

  getFavoriteTracks: async (forceRefresh = false): Promise<Track[]> => {
    try {
      const now = Date.now();
      const cachedFavorites = TRACK_CACHE.selections.get(-1);
      
      if (!forceRefresh && cachedFavorites) {
        const isCacheValid = (now - cachedFavorites.timestamp) < CACHE_DURATION;
        if (isCacheValid) {
          console.log('[API] Используем кэшированные избранные треки');
          return cachedFavorites.data;
        }
      }

      console.log('[API] Запрашиваем избранные треки...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('[API] Токен отсутствует, возвращаем пустой массив');
        return [];
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 секунд для избранных
      
      const response = await fetch(`${API_URL}/catalog/track/favorite/all/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('[API] Статус ответа избранных треков:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('[API] Ошибка 401 - неавторизован');
          throw new Error('Необходима авторизация');
        }
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const data = await response.json();
      const rawTracks = extractTracksFromResponse(data);
      
      console.log(`[API] Получено ${rawTracks.length} избранных треков`);
      
      const normalizedTracks = rawTracks.map(normalizeTrack);
      
      TRACK_CACHE.selections.set(-1, {
        data: normalizedTracks,
        timestamp: now
      });
      
      return normalizedTracks;
      
    } catch (error: any) {
      console.error('[API] Ошибка получения избранных треков:', error);
      
      const cachedFavorites = TRACK_CACHE.selections.get(-1);
      if (cachedFavorites) {
        console.log('[API] Используем кэшированные избранные треки из-за ошибки');
        return cachedFavorites.data;
      }
      
      if (error.name === 'AbortError') {
        console.warn('[API] Запрос прерван по таймауту');
        return []; 
      }
      
      if (error.message === 'Необходима авторизация') {
        return [];
      }
      
      return []; 
    }
  },

  toggleLike: async (trackId: number, isLiked: boolean): Promise<boolean> => {
    try {
      if (isLiked) {
        await trackService.dislikeTrack(trackId);
        console.log(`Track ${trackId} unliked`);
        return false;
      } else {
        await trackService.likeTrack(trackId);
        console.log(`Track ${trackId} liked`);
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  clearCache: (): void => {
    TRACK_CACHE.allTracks = null;
    TRACK_CACHE.allTracksTimestamp = null;
    TRACK_CACHE.selections.clear();
    console.log('[API] Кэш очищен');
  },

  invalidateSelectionCache: (selectionId: number): void => {
    TRACK_CACHE.selections.delete(selectionId);
    console.log(`[API] Кэш подборки #${selectionId} очищен`);
  },

  invalidateAllTracksCache: (): void => {
    TRACK_CACHE.allTracks = null;
    TRACK_CACHE.allTracksTimestamp = null;
    console.log('[API] Кэш всех треков очищен');
  }
};