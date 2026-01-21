import axios from 'axios';
import { ITrack } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const trackService = {
  getAllTracks: async (): Promise<ITrack[]> => {
    try {
      const response = await api.get('/tracks/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching tracks:', error);
      throw error;
    }
  },

  getSelectionTracks: async (selectionId: number): Promise<ITrack[]> => {
    try {
      const response = await api.get(`/selections/${selectionId}/tracks`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching selection ${selectionId} tracks:`, error);
      throw error;
    }
  },

  likeTrack: async (trackId: number | string): Promise<void> => {
    try {
      await api.post(`/tracks/${trackId}/like`);
    } catch (error) {
      console.error('Error liking track:', error);
      throw error;
    }
  },

  dislikeTrack: async (trackId: number | string): Promise<void> => {
    try {
      await api.post(`/tracks/${trackId}/dislike`);
    } catch (error) {
      console.error('Error disliking track:', error);
      throw error;
    }
  },
};