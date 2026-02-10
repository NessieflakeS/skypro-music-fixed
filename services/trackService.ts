import axios from 'axios';
import { Track, Selection } from '@/types';
import { apiClient } from './apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://webdev-music-003b5b991590.herokuapp.com';

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

export const trackService = {
  getAllTracks: async (): Promise<Track[]> => {
    try {
      console.log('[API] Запрашиваю все треки...');
      const response = await apiClient.get('/catalog/track/all/');
      console.log('[API] Сырой ответ (все треки):', response.data);

      let rawTracks: any[] = [];
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        rawTracks = response.data.data;
        console.log(`[API] Нашел ${rawTracks.length} треков в data`);
      } else if (Array.isArray(response.data)) {
        rawTracks = response.data;
        console.log(`[API] Нашел ${rawTracks.length} треков (прямой массив)`);
      }

      const normalizedTracks: Track[] = rawTracks.map((item: any, index: number) => {
        if (index === 0) {
          console.log('[API] Пример сырого трека:', item);
        }
        
        return {
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
        };
      });

      console.log(`[API] Нормализовано треков: ${normalizedTracks.length}`);
      
      const tracksWithAudio = normalizedTracks.filter(t => t.track_file && t.track_file.trim() !== '');
      console.log(`[API] Треков с аудиофайлами: ${tracksWithAudio.length}`);
      
      if (tracksWithAudio.length === 0 && normalizedTracks.length > 0) {
        console.warn('[API] ВНИМАНИЕ: У треков нет поля track_file! Воспроизведение невозможно.');
      }

      return normalizedTracks;
    } catch (error: any) {
      console.error('[API] Ошибка получения всех треков:', error);
      throw new Error('Не удалось загрузить треки');
    }
  },

  getSelectionTracks: async (selectionId: number): Promise<Track[]> => {
    try {
      console.log(`[API] Запрашиваю подборку #${selectionId}...`);
      const response = await apiClient.get(`/catalog/selection/${selectionId}/`);
      console.log(`[API] Сырой ответ подборки #${selectionId}:`, response.data);

      if (response.data?.data === null) {
        console.log(`[API] Подборка #${selectionId} существует, но пуста (data: null)`);
        return [];
      }

      const selectionData = response.data?.data;
      const itemIds: number[] = selectionData?.items || [];
      
      console.log(`[API] Подборка "${selectionData?.name || 'Без названия'}" содержит ${itemIds.length} ID треков:`, itemIds);
      
      if (itemIds.length === 0) {
        console.warn(`[API] Подборка #${selectionId} не содержит ID треков.`);
        return [];
      }

      const allTracks = await trackService.getAllTracks();
      console.log(`[API] Получил ${allTracks.length} всех треков с сервера`);

      const tracksForSelection = allTracks.filter((track) => {
        const found = itemIds.includes(track.id);
        return found;
      });

      console.log(`[API] Для подборки #${selectionId} найдено ${tracksForSelection.length} треков`);
      
      if (tracksForSelection.length === 0 && allTracks.length > 0) {
        console.warn('[API] Не удалось сопоставить ID треков. Проверьте соответствие:');
        console.warn('[API] ID в подборке:', itemIds);
        console.warn('[API] ID всех доступных треков:', allTracks.map(t => t.id));
      }

      return tracksForSelection;

    } catch (error: any) {
      console.error(`[API] Ошибка загрузки подборки ${selectionId}:`, error);
      
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
      console.log('[API] Запрашиваю все подборки...');
      const response = await api.get('/catalog/selection/all/');
      console.log('[API] Ответ подборок:', response.data);
      
      let selections: Selection[] = [];
      
      if (response.data && response.data.success && response.data.data) {
        selections = response.data.data.map((selection: any): Selection => ({
          id: selection.id || selection._id || 0,
          name: selection.name || `Подборка`,
          items: selection.items || [],
          tracks: selection.tracks || []
        }));
      } else if (Array.isArray(response.data)) {
        selections = response.data.map((selection: any): Selection => ({
          id: selection.id || selection._id || 0,
          name: selection.name || `Подборка`,
          items: selection.items || [],
          tracks: selection.tracks || []
        }));
      }
      
      console.log(`[API] Успешно получено ${selections.length} подборок`);
      return selections;
    } catch (error: any) {
      console.error('[API] Ошибка получения подборок:', error);
      return [];
    }
  },

  getSelectionInfo: async (selectionId: number): Promise<Selection | null> => {
    try {
      console.log(`[API] Запрашиваю информацию о подборке ${selectionId}...`);
      const response = await api.get(`/catalog/selection/${selectionId}/`);
      console.log('[API] Информация о подборке:', response.data);
      
      let selectionData: any = null;
      
      if (response.data && response.data.success && response.data.data) {
        selectionData = response.data.data;
      } else if (response.data) {
        selectionData = response.data;
      }
      
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
    } catch (error) {
      console.error('[API] Ошибка добавления в избранное:', error);
      throw error;
    }
  },

  dislikeTrack: async (trackId: number): Promise<void> => {
    try {
      await api.delete(`/catalog/track/${trackId}/favorite/`);
      console.log(`[API] Трек ${trackId} удален из избранного`);
    } catch (error) {
      console.error('[API] Ошибка удаления из избранного:', error);
      throw error;
    }
  },

  getFavoriteTracks: async (): Promise<Track[]> => {
    try {
      console.log('[API] Запрашиваю избранные треки...');
      const response = await api.get('/catalog/track/favorite/all/');
      
      let tracks: Track[] = [];
      if (response.data && Array.isArray(response.data)) {
        tracks = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (response.data.results && Array.isArray(response.data.results)) {
          tracks = response.data.results;
        } else if (response.data.tracks && Array.isArray(response.data.tracks)) {
          tracks = response.data.tracks;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          tracks = response.data.items;
        } else {
          tracks = Object.values(response.data);
        }
      }
      
      console.log('[API] Избранных треков:', tracks.length);
      return tracks;
    } catch (error) {
      console.error('[API] Ошибка получения избранных треков:', error);
      throw error;
    }
  },
};