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

interface ApiResponse {
  tracks?: Track[];
  data?: Track[];
  items?: Track[];
  results?: Track[];
  [key: string]: any;
}

interface SelectionResponse {
  id: number;
  name: string;
  items: Track[];
  tracks?: Track[];
}

export const trackService = {
  getAllTracks: async (): Promise<Track[]> => {
    try {
      console.log('Fetching tracks from API...');
      
      const endpoints = [
        '/catalog/track/all/',
        '/tracks/',
        '/track/all/',
        '/music/tracks/'
      ];
      
      let lastError: any;
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get<ApiResponse>(endpoint);
          console.log(`Response from ${endpoint}:`, response.data);
          
          const data = response.data;
          let tracks: Track[] = [];
          
          if (data.tracks && Array.isArray(data.tracks)) {
            tracks = data.tracks;
          } else if (data.data && Array.isArray(data.data)) {
            tracks = data.data;
          } else if (data.items && Array.isArray(data.items)) {
            tracks = data.items;
          } else if (data.results && Array.isArray(data.results)) {
            tracks = data.results;
          } else if (Array.isArray(data)) {
            tracks = data;
          } else {
            for (const key in data) {
              if (Array.isArray(data[key])) {
                tracks = data[key];
                console.log(`Found tracks in property: ${key}`);
                break;
              }
            }
          }
          
          console.log(`Tracks fetched successfully from ${endpoint}, count:`, tracks.length);
          return tracks;
          
        } catch (err: unknown) {
          const error = err as any;
          console.log(`Endpoint ${endpoint} failed:`, error.response?.status || error.message);
          lastError = error;
          continue;
        }
      }
      
      throw lastError;
      
    } catch (error: any) {
      console.error('Error fetching tracks:', error);
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Не удалось подключиться к серверу. Проверьте интернет-соединение.');
      }
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.detail || error.response.data?.message || `Ошибка ${status}`;
        
        if (status === 401) {
          throw new Error('Требуется авторизация. Пожалуйста, войдите в систему.');
        } else if (status === 403) {
          throw new Error('У вас нет доступа к этому ресурсу.');
        } else if (status === 404) {
          throw new Error('Эндпоинт для треков не найден. Пожалуйста, проверьте подключение к API.');
        } else if (status >= 500) {
          throw new Error('Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.');
        } else {
          throw new Error(message);
        }
      }
      
      throw new Error('Произошла неизвестная ошибка при загрузке треков.');
    }
  },

  getSelectionTracks: async (selectionId: number): Promise<Track[]> => {
    try {
      console.log(`Fetching selection ${selectionId} tracks`);
      
      const endpoints = [
        `/catalog/selection/${selectionId}/`,
        `/selections/${selectionId}/`,
        `/playlist/${selectionId}/`
      ];
      
      let lastError: any;
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get<ApiResponse>(endpoint); // Используем только ApiResponse
          console.log(`Response from ${endpoint}:`, response.data);
          
          let tracks: Track[] = [];
          const data = response.data;
          
          if ('tracks' in data && Array.isArray(data.tracks)) {
            tracks = data.tracks;
          } else if ('items' in data && Array.isArray(data.items)) {
            tracks = data.items;
          } else if (data.data && Array.isArray(data.data)) {
            tracks = data.data;
          } else if (Array.isArray(data)) {
            tracks = data;
          }
          
          console.log(`Selection ${selectionId} fetched successfully from ${endpoint}, tracks:`, tracks.length);
          return tracks;
          
        } catch (err: unknown) {
          const error = err as any;
          console.log(`Endpoint ${endpoint} failed:`, error.response?.status || error.message);
          lastError = error;
          continue;
        }
      }
      
      throw lastError;
      
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
      const endpoints = [
        `/catalog/track/${trackId}/favorite/`,
        `/tracks/${trackId}/favorite/`
      ];
      
      let lastError: any;
      
      for (const endpoint of endpoints) {
        try {
          await api.post(endpoint);
          console.log(`Track ${trackId} liked successfully`);
          return;
        } catch (err: unknown) {
          const error = err as any;
          console.log(`Like endpoint ${endpoint} failed:`, error.response?.status || error.message);
          lastError = error;
          continue;
        }
      }
      
      throw lastError;
      
    } catch (error) {
      console.error('Error liking track:', error);
      throw error;
    }
  },

  dislikeTrack: async (trackId: number): Promise<void> => {
    try {
      const endpoints = [
        `/catalog/track/${trackId}/favorite/`,
        `/tracks/${trackId}/favorite/`
      ];
      
      let lastError: any;
      
      for (const endpoint of endpoints) {
        try {
          await api.delete(endpoint);
          console.log(`Track ${trackId} disliked successfully`);
          return;
        } catch (err: unknown) {
          const error = err as any;
          console.log(`Dislike endpoint ${endpoint} failed:`, error.response?.status || error.message);
          lastError = error;
          continue;
        }
      }
      
      throw lastError;
      
    } catch (error) {
      console.error('Error disliking track:', error);
      throw error;
    }
  },
};