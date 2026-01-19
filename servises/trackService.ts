import api from './api';
import { Track } from '@/types';

export interface ApiTrack {
  _id: number;
  name: string;
  author: string;
  release_date: string;
  genre: string[];
  duration_in_seconds: number;
  album: string;
  logo: string | null;
  track_file: string;
  stared_user: any[];
}

export const trackService = {
  async getAllTracks(): Promise<ApiTrack[]> {
    const response = await api.get('/catalog/track/all/');
    return response.data;
  },

  async getSelectionTracks(selectionId: number): Promise<ApiTrack[]> {
    const response = await api.get(`/catalog/selection/${selectionId}/`);
    return response.data;
  },
};