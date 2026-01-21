import { Track } from '@/types';
import { data } from '@/data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockTrackService = {
  getAllTracks: async (): Promise<Track[]> => {
    console.log('Using mock track service - fetching all tracks');
    await delay(300); 
    return data;
  },

  getSelectionTracks: async (selectionId: number): Promise<Track[]> => {
    console.log(`Using mock track service - fetching selection ${selectionId}`);
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
  },

  likeTrack: async (trackId: number): Promise<void> => {
    console.log(`Mock: Track ${trackId} liked`);
    await delay(200);
  },

  dislikeTrack: async (trackId: number): Promise<void> => {
    console.log(`Mock: Track ${trackId} disliked`);
    await delay(200);
  },
};