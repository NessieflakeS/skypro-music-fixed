import { useState, useCallback, useMemo } from 'react';
import { Track, ITrackDisplay } from '@/types/index';
import { trackService } from '@/services/trackService';
import { formatTime } from '@/utils/formatTime';

export const useTracks = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTracks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trackService.getAllTracks();
      setTracks(data);
    } catch (err: unknown) {
      let message = 'Ошибка загрузки треков';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      console.error('Ошибка загрузки треков:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const tracksForDisplay = useMemo((): ITrackDisplay[] => {
    return tracks.map((track) => ({
      id: track.id || track._id || 0,
      name: track.name || 'Без названия',
      author: track.author || 'Неизвестный исполнитель',
      album: track.album || 'Без альбома',
      time: formatTime(track.duration_in_seconds || 0),
      track_file: track.track_file || '',
      link: '#',
      authorLink: '#',
      albumLink: '#',
      genre: track.genre || [],
      release_date: track.release_date || '',
    }));
  }, [tracks]);

  return {
    tracks,
    tracksForDisplay,
    loading,
    error,
    loadTracks,
  };
};