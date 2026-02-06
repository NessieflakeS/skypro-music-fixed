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
        console.log('Fetching all tracks...');
        const response = await apiClient.get('/catalog/track/all/');
        console.log('Tracks response:', response.data);
        
        let tracks: Track[] = [];
        
        if (response.data && response.data.success && response.data.data) {
          tracks = response.data.data;
        } else if (Array.isArray(response.data)) {
          tracks = response.data;
        }
        
        console.log('Tracks fetched successfully:', tracks.length);
        return tracks;
      } catch (error: any) {
        console.error('Error fetching tracks:', error);
        throw new Error('Не удалось загрузить треки');
      }
    },

  getSelectionTracks: async (selectionId: number): Promise<Track[]> => {
    try {
      console.log(`Fetching selection ${selectionId} tracks...`);
      const response = await api.get(`/catalog/selection/${selectionId}/`);
      console.log('Selection response:', response.data);
      
      let tracks: Track[] = [];
      
      if (response.data && response.data.success && response.data.data) {
        const selectionData = response.data.data;
        if (selectionData.items && Array.isArray(selectionData.items)) {
          tracks = selectionData.items;
        } else if (selectionData.tracks && Array.isArray(selectionData.tracks)) {
          tracks = selectionData.tracks;
        } else if (Array.isArray(selectionData)) {
          tracks = selectionData;
        }
      } else if (response.data && Array.isArray(response.data)) {
        tracks = response.data;
      } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        tracks = response.data.items;
      } else if (response.data && response.data.tracks && Array.isArray(response.data.tracks)) {
        tracks = response.data.tracks;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        tracks = response.data.data;
      }
      
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

  getAllSelections: async (): Promise<Selection[]> => {
    try {
      console.log('Fetching all selections from API...');
      const response = await api.get('/catalog/selection/all/');
      console.log('Selections API response:', response.data);
      
      let selections: Selection[] = [];
      
      if (response.data && response.data.success && response.data.data) {
        console.log('Формат 1: response.data.data');
        selections = response.data.data;
      } else if (Array.isArray(response.data)) {
        console.log('Формат 2: response.data (массив)');
        selections = response.data;
      } else if (response.data && response.data.results) {
        console.log('Формат 3: response.data.results');
        selections = response.data.results;
      } else if (response.data) {
        console.log('Формат 4: response.data (объект)');
        selections = Object.values(response.data).flat();
      }
      
      console.log(`Successfully fetched ${selections.length} selections from API`);
      return selections;
    } catch (error: any) {
      console.error('Error fetching selections from API:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return [];
    }
  },

  getSelectionInfo: async (selectionId: number): Promise<Selection | null> => {
    try {
      console.log(`Fetching selection ${selectionId} info...`);
      const response = await api.get(`/catalog/selection/${selectionId}/`);
      console.log('Selection info response:', response.data);
      
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
      console.error(`Error fetching selection ${selectionId} info:`, error);
      return null;
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
      
      console.log('Favorite tracks fetched:', tracks.length);
      return tracks;
    } catch (error) {
      console.error('Error fetching favorite tracks:', error);
      throw error;
    }
  },
};