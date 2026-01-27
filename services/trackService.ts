import axios from 'axios';
import { Track } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://webdev-music-003b5b991590.herokuapp.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Пытаемся обновить токен
          const response = await axios.post<{ access: string }>(`${API_URL}/user/token/refresh/`, {
            refresh: refreshToken
          });
          
          const newAccessToken = response.data.access;
          localStorage.setItem('token', newAccessToken);
          
          // Обновляем заголовок и повторяем запрос
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Если не удалось обновить токен, делаем logout
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

export interface SelectionResponse {
  id: number;
  name: string;
  items: Track[];
  tracks?: Track[];
}

export const trackService = {
  getAllTracks: async (): Promise<Track[]> => {
    try {
      console.log('Fetching all tracks...');
      const response = await api.get<Track[]>('/catalog/track/all/');
      console.log('Tracks fetched successfully:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching tracks:', error);
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          throw new Error('Требуется авторизация');
        } else if (status === 403) {
          throw new Error('Доступ запрещен');
        } else if (status === 404) {
          throw new Error('Треки не найдены');
        } else {
          throw new Error(`Ошибка сервера: ${status}`);
        }
      }
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Сервер временно недоступен');
      }
      
      throw new Error('Неизвестная ошибка при загрузке треков');
    }
  },

  getSelectionTracks: async (selectionId: number): Promise<Track[]> => {
    try {
      console.log(`Fetching selection ${selectionId} tracks...`);
      const response = await api.get<SelectionResponse>(`/catalog/selection/${selectionId}/`);
      
      // API может возвращать треки в поле items или tracks
      const tracks = response.data.items || response.data.tracks || [];
      console.log(`Selection ${selectionId} tracks fetched:`, tracks.length);
      return tracks;
    } catch (error: any) {
      console.error(`Error fetching selection ${selectionId} tracks:`, error);
      
      if (error.response?.status === 404) {
        throw new Error(`Подборка ${selectionId} не найдена`);
      }
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Сервер временно недоступен');
      }
      
      throw new Error(`Ошибка загрузки подборки: ${error.message}`);
    }
  },

  likeTrack: async (trackId: number): Promise<void> => {
    try {
      await api.post(`/catalog/track/${trackId}/favorite/`);
      console.log(`Track ${trackId} liked successfully`);
    } catch (error) {
      console.error('Error liking track:', error);
      throw error;
    }
  },

  dislikeTrack: async (trackId: number): Promise<void> => {
    try {
      await api.delete(`/catalog/track/${trackId}/favorite/`);
      console.log(`Track ${trackId} disliked successfully`);
    } catch (error) {
      console.error('Error disliking track:', error);
      throw error;
    }
  },

  getFavoriteTracks: async (): Promise<Track[]> => {
    try {
      console.log('Fetching favorite tracks...');
      const response = await api.get<Track[]>('/catalog/track/favorite/all/');
      console.log('Favorite tracks fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('Error fetching favorite tracks:', error);
      throw error;
    }
  },
};