import axios from 'axios';
import { Track } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const trackService = {
  getAllTracks: async (): Promise<Track[]> => {
    try {
      console.log('Fetching tracks from:', `${API_URL}/tracks/all`);
      const response = await api.get<Track[]>('/tracks/all');
      console.log('Tracks fetched successfully:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching tracks:', error);
      
      if (error.code === 'ERR_NETWORK') {
        console.warn('Network error - API server might be down');
        throw new Error('Сервер временно недоступен. Пожалуйста, попробуйте позже.');
      }
      
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
      
      throw new Error('Неизвестная ошибка при загрузке треков');
    }
  },

  getSelectionTracks: async (selectionId: number): Promise<Track[]> => {
    try {
      console.log(`Fetching selection ${selectionId} tracks`);
      const response = await api.get<Track[]>(`/selections/${selectionId}/tracks`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching selection ${selectionId} tracks:`, error);
      
      if (error.response?.status === 404) {
        throw new Error(`Подборка ${selectionId} не найдена`);
      }
      
      throw new Error(`Ошибка загрузки подборки: ${error.message}`);
    }
  },

  likeTrack: async (trackId: number): Promise<void> => {
    try {
      await api.post(`/tracks/${trackId}/like`);
    } catch (error) {
      console.error('Error liking track:', error);
      throw error;
    }
  },

  dislikeTrack: async (trackId: number): Promise<void> => {
    try {
      await api.post(`/tracks/${trackId}/dislike`);
    } catch (error) {
      console.error('Error disliking track:', error);
      throw error;
    }
  },
};