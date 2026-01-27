import axios from 'axios';
import { Track } from '@/types';

const API_URL = 'https://webdev-music-003b5b991590.herokuapp.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  tracks?: Track[];
  items?: Track[];
  [key: string]: any;
}

export const trackService = {
  getAllTracks: async (): Promise<Track[]> => {
    try {
      const response = await api.get<ApiResponse<Track[]>>('/catalog/track/all/');
      const responseData = response.data;
      
      if (responseData.success && Array.isArray(responseData.data)) {
        return responseData.data;
      }
      
      if (Array.isArray(responseData)) {
        return responseData;
      }
      
      if (responseData.tracks && Array.isArray(responseData.tracks)) {
        return responseData.tracks;
      }
      
      if (responseData.data && Array.isArray(responseData.data)) {
        return responseData.data;
      }
      
      if (responseData.items && Array.isArray(responseData.items)) {
        return responseData.items;
      }
      
      return [];
      
    } catch (error: any) {
      console.error('Error fetching tracks:', error);
      throw new Error(error.message || 'Ошибка загрузки треков');
    }
  },

  getSelectionTracks: async (selectionId: number): Promise<Track[]> => {
    try {
      console.log(`Fetching selection ${selectionId}`);
      
      const response = await api.get<ApiResponse<Track[]>>(`/catalog/selection/${selectionId}/`);
      const responseData = response.data;
      
      if (responseData.success && Array.isArray(responseData.data)) {
        return responseData.data;
      }
      
      if (Array.isArray(responseData)) {
        return responseData;
      }
      
      if (responseData.tracks && Array.isArray(responseData.tracks)) {
        return responseData.tracks;
      }
      
      if (responseData.items && Array.isArray(responseData.items)) {
        return responseData.items;
      }
      
      return [];
      
    } catch (error: any) {
      console.error(`Error fetching selection ${selectionId}:`, error);
      
      if (error.response?.status === 404) {
        return [];
      }
      
      throw new Error(error.message || 'Ошибка загрузки подборки');
    }
  },

  likeTrack: async (trackId: number): Promise<void> => {
    try {
      await api.post(`/catalog/track/${trackId}/favorite/`);
    } catch (error) {
      console.error('Error liking track:', error);
      throw error;
    }
  },

  dislikeTrack: async (trackId: number): Promise<void> => {
    try {
      await api.delete(`/catalog/track/${trackId}/favorite/`);
    } catch (error) {
      console.error('Error disliking track:', error);
      throw error;
    }
  },
};