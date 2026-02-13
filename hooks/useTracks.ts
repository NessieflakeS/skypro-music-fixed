import { useState, useCallback, useMemo } from 'react';
import { Track, ITrackDisplay } from '@/types/index';
import { trackService } from '@/services/trackService';

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
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки треков');
      console.error('Ошибка загрузки треков:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDuration = useCallback((seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const tracksForDisplay = useMemo((): ITrackDisplay[] => {
    return tracks.map((track: Track) => ({
      id: track.id || track._id || 0,
      name: track.name || "Без названия",
      author: track.author || "Неизвестный исполнитель",
      album: track.album || "Без альбома",
      time: formatDuration(track.duration_in_seconds || 0),
      track_file: track.track_file || "",
      link: "#",
      authorLink: "#",
      albumLink: "#",
      genre: track.genre || [],
      release_date: track.release_date || "",
    }));
  }, [tracks, formatDuration]);

  return {
    tracks,
    tracksForDisplay,
    loading,
    error,
    loadTracks,
    formatDuration,
  };
};