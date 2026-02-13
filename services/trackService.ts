import axios from 'axios';
import { Track, Selection } from '@/types/index';
import { apiClient } from './apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://webdev-music-003b5b991590.herokuapp.com';

interface RawTrack {
  id?: number;
  _id?: number;
  name?: string;
  title?: string;
  author?: string;
  artist?: string;
  album?: string;
  duration_in_seconds?: number;
  duration?: number;
  track_file?: string;
  audio_file?: string;
  url?: string;
  release_date?: string;
  genre?: string | string[];
  logo?: string | null;
  stared_user?: number[];
}

interface ApiSelection {
  id?: number;
  _id?: number;
  name?: string;
  items?: number[];
  tracks?: Track[];
}

const TRACK_CACHE: {
  allTracks: Track[] | null;
  allTracksTimestamp: number | null;
  selections: Map<number, { data: Track[]; timestamp: number }>;
} = {
  allTracks: null,
  allTracksTimestamp: null,
  selections: new Map(),
};

const CACHE_DURATION = 5 * 60 * 1000;

const normalizeTrack = (item: RawTrack, index: number): Track => ({
  id: item.id || item._id || index + 1,
  name: item.name || item.title || `Трек ${index + 1}`,
  author: item.author || item.artist || 'Неизвестный исполнитель',
  album: item.album || 'Без альбома',
  duration_in_seconds: item.duration_in_seconds || item.duration || 180,
  track_file: item.track_file || item.audio_file || item.url || '',
  release_date: item.release_date || '2023-01-01',
  genre: Array.isArray(item.genre) ? item.genre : (item.genre ? [item.genre] : ['Не указан']),
  logo: item.logo || null,
  stared_user: item.stared_user || [],
});

const extractTracksFromResponse = (data: unknown): RawTrack[] => {
  if (data && typeof data === 'object' && 'success' in data && Array.isArray((data as any).data)) {
    return (data as any).data;
  } else if (Array.isArray(data)) {
    return data;
  }
  return [];
};

export const trackService = {
  getAllTracks: async (forceRefresh = false): Promise<Track[]> => {
    try {
      const now = Date.now();

      if (!forceRefresh && TRACK_CACHE.allTracks && TRACK_CACHE.allTracksTimestamp &&
          (now - TRACK_CACHE.allTracksTimestamp) < CACHE_DURATION) {
        return TRACK_CACHE.allTracks;
      }

      const response = await apiClient.get('/catalog/track/all/');
      const rawTracks = extractTracksFromResponse(response.data);
      const normalizedTracks = rawTracks.map(normalizeTrack);

      TRACK_CACHE.allTracks = normalizedTracks;
      TRACK_CACHE.allTracksTimestamp = now;

      return normalizedTracks;
    } catch (error: unknown) {
      if (TRACK_CACHE.allTracks) {
        return TRACK_CACHE.allTracks;
      }
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Не удалось загрузить треки');
      }
      throw new Error('Не удалось загрузить треки');
    }
  },

  getSelectionTracks: async (selectionId: number, forceRefresh = false): Promise<Track[]> => {
    try {
      const now = Date.now();
      const cachedSelection = TRACK_CACHE.selections.get(selectionId);

      if (!forceRefresh && cachedSelection && (now - cachedSelection.timestamp) < CACHE_DURATION) {
        return cachedSelection.data;
      }

      const response = await apiClient.get(`/catalog/selection/${selectionId}/`);

      if (response.data?.data === null) {
        TRACK_CACHE.selections.set(selectionId, { data: [], timestamp: now });
        return [];
      }

      const selectionData = response.data?.data as ApiSelection;
      const itemIds: number[] = selectionData?.items || [];

      if (itemIds.length === 0) {
        TRACK_CACHE.selections.set(selectionId, { data: [], timestamp: now });
        return [];
      }

      const allTracks = TRACK_CACHE.allTracks || await trackService.getAllTracks();
      const tracksForSelection = allTracks.filter(track => itemIds.includes(track.id));

      TRACK_CACHE.selections.set(selectionId, { data: tracksForSelection, timestamp: now });

      return tracksForSelection;
    } catch (error: unknown) {
      const cachedSelection = TRACK_CACHE.selections.get(selectionId);
      if (cachedSelection) {
        return cachedSelection.data;
      }
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Подборка ${selectionId} не найдена`);
        }
        if (error.code === 'ERR_NETWORK') {
          throw new Error('Сервер временно недоступен');
        }
        throw new Error(`Ошибка загрузки подборки: ${error.message}`);
      }
      throw new Error(`Ошибка загрузки подборки: ${selectionId}`);
    }
  },

  getAllSelections: async (): Promise<Selection[]> => {
    try {
      const response = await apiClient.get('/catalog/selection/all/');

      const selectionsData = response.data?.success ? response.data.data : response.data;
      const selectionsArray = Array.isArray(selectionsData) ? selectionsData : [];

      const selections: Selection[] = selectionsArray.map((selection: ApiSelection) => ({
        id: selection.id || selection._id || 0,
        name: selection.name || 'Подборка',
        items: selection.items || [],
        tracks: selection.tracks || [],
      }));

      return selections;
    } catch (error: unknown) {
      return [];
    }
  },

  getSelectionInfo: async (selectionId: number): Promise<Selection | null> => {
    try {
      const response = await apiClient.get(`/catalog/selection/${selectionId}/`);
      const selectionData = response.data?.success ? response.data.data : response.data as ApiSelection;

      if (selectionData) {
        return {
          id: selectionData.id || selectionData._id || selectionId,
          name: selectionData.name || `Подборка ${selectionId}`,
          items: selectionData.items || [],
          tracks: selectionData.tracks || [],
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  likeTrack: async (trackId: number): Promise<void> => {
    try {
      await apiClient.post(`/catalog/track/${trackId}/favorite/`);
      TRACK_CACHE.selections.delete(-1);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Ошибка добавления в избранное');
      }
      throw new Error('Ошибка добавления в избранное');
    }
  },

  dislikeTrack: async (trackId: number): Promise<void> => {
    try {
      await apiClient.delete(`/catalog/track/${trackId}/favorite/`);
      TRACK_CACHE.selections.delete(-1);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Ошибка удаления из избранного');
      }
      throw new Error('Ошибка удаления из избранного');
    }
  },

  getFavoriteTracks: async (): Promise<Track[]> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return [];

      const response = await apiClient.get('/catalog/track/favorite/all/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      let tracks: Track[] = [];
      const data = response.data;

      if (data?.success && Array.isArray(data.data)) {
        tracks = data.data;
      } else if (Array.isArray(data)) {
        tracks = data;
      }

      return tracks;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const refreshResponse = await axios.post(`${API_URL}/user/token/refresh/`, {
              refresh: refreshToken,
            });
            const newAccessToken = refreshResponse.data.access;
            localStorage.setItem('token', newAccessToken);

            const retryResponse = await apiClient.get('/catalog/track/favorite/all/', {
              headers: { Authorization: `Bearer ${newAccessToken}` },
            });

            let tracks: Track[] = [];
            const data = retryResponse.data;
            if (data?.success && Array.isArray(data.data)) {
              tracks = data.data;
            } else if (Array.isArray(data)) {
              tracks = data;
            }
            return tracks;
          }
        } catch {
        }
      }
      return [];
    }
  },

  toggleLike: async (trackId: number, isLiked: boolean): Promise<boolean> => {
    try {
      if (isLiked) {
        await trackService.dislikeTrack(trackId);
        return false;
      } else {
        await trackService.likeTrack(trackId);
        return true;
      }
    } catch (error: unknown) {
      throw error;
    }
  },

  clearCache: (): void => {
    TRACK_CACHE.allTracks = null;
    TRACK_CACHE.allTracksTimestamp = null;
    TRACK_CACHE.selections.clear();
  },

  invalidateSelectionCache: (selectionId: number): void => {
    TRACK_CACHE.selections.delete(selectionId);
  },

  invalidateAllTracksCache: (): void => {
    TRACK_CACHE.allTracks = null;
    TRACK_CACHE.allTracksTimestamp = null;
  },
};