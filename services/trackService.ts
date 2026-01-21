import axios from 'axios';
import { Track } from '@/types';
import { data } from '@/data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || true; 

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, 
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
    if (USE_MOCK) {
      console.log('Using mock data for tracks');
      await delay(300);
      return data;
    }

    try {
      console.log('Fetching tracks from API...');
      const response = await api.get<Track[]>('/tracks/all');
      console.log('Successfully fetched tracks from API');
      return response.data;
    } catch (error: any) {
      console.warn('API недоступен, используем локальные данные');
      console.log('Falling back to mock data');
      await delay(300);
      return data;
    }
  },

  getSelectionTracks: async (selectionId: number): Promise<Track[]> => {
    if (USE_MOCK) {
      console.log(`Using mock data for selection ${selectionId}`);
      await delay(300);
      
      switch(selectionId) {
        case 1: 
          return data.slice(0, 8);
        case 2: 
          return data.slice(8, 16);
        case 3: 
          return data.slice(16, 24);
        default:
          return data.slice(0, 8);
      }
    }

    try {
      console.log(`Fetching selection ${selectionId} from API...`);
      const response = await api.get<Track[]>(`/selections/${selectionId}/tracks`);
      return response.data;
    } catch (error: any) {
      console.warn(`API недоступен для selection ${selectionId}, используем локальные данные`);
      await delay(300);
      
      switch(selectionId) {
        case 1:
          return data.slice(0, 8);
        case 2:
          return data.slice(8, 16);
        case 3:
          return data.slice(16, 24);
        default:
          return data.slice(0, 8);
      }
    }
  },

  likeTrack: async (trackId: number): Promise<void> => {
    if (USE_MOCK) {
      console.log(`Mock: Track ${trackId} liked`);
      await delay(200);
      return;
    }

    try {
      await api.post(`/tracks/${trackId}/like`);
    } catch (error) {
      console.error('Error liking track:', error);
      throw error;
    }
  },

  dislikeTrack: async (trackId: number): Promise<void> => {
    if (USE_MOCK) {
      console.log(`Mock: Track ${trackId} disliked`);
      await delay(200);
      return;
    }

    try {
      await api.post(`/tracks/${trackId}/dislike`);
    } catch (error) {
      console.error('Error disliking track:', error);
      throw error;
    }
  },
};