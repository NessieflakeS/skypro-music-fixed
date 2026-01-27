import axios from 'axios';
import { Track } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://webdev-music-003b5b991590.herokuapp.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export const trackService = {
  getAllTracks: async (): Promise<Track[]> => {
    try {
      const response = await api.get<Track[]>('/tracks/all/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching tracks:', error);
      throw new Error(error.response?.data?.detail || 'Ошибка загрузки треков');
    }
  },

  getSelectionTracks: async (selectionId: number): Promise<Track[]> => {
    try {
      interface SelectionResponse {
        tracks: Track[];
      }
      const response = await api.get<SelectionResponse>(`/selections/${selectionId}/`);
      return response.data.tracks || [];
    } catch (error: any) {
      console.error(`Error fetching selection ${selectionId} tracks:`, error);
      throw new Error(error.response?.data?.detail || 'Ошибка загрузки подборки');
    }
  },

  likeTrack: async (trackId: number): Promise<void> => {
    try {
      await api.post(`/tracks/${trackId}/favorite/`);
    } catch (error: any) {
      console.error('Error liking track:', error);
      throw new Error(error.response?.data?.detail || 'Ошибка добавления в избранное');
    }
  },

  dislikeTrack: async (trackId: number): Promise<void> => {
    try {
      await api.delete(`/tracks/${trackId}/favorite/`);
    } catch (error: any) {
      console.error('Error disliking track:', error);
      throw new Error(error.response?.data?.detail || 'Ошибка удаления из избранного');
    }
  },
};