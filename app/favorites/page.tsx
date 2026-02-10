"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import TrackList from "@/components/TrackList";
import { trackService } from "@/services/trackService";
import { ITrackDisplay, Track } from "@/types";
import { RootState } from "@/store/store";
import { setFavoriteTracks } from "@/store/userSlice";
import styles from "@/app/page.module.css";

const formatDuration = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function FavoritesPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user, favoriteTracks } = useSelector((state: RootState) => state.user);
  const [tracks, setTracks] = useState<ITrackDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [hasAttemptedDirectLoad, setHasAttemptedDirectLoad] = useState(false);

  const loadAllTracks = useCallback(async (): Promise<Track[]> => {
    try {
      const data = await trackService.getAllTracks();
      setAllTracks(data);
      return data;
    } catch (err: any) {
      console.error('Ошибка загрузки всех треков:', err);
      throw err;
    }
  }, []);

  const filterFavoriteTracksToDisplay = useCallback((tracks: Track[]): ITrackDisplay[] => {
    console.log("Фильтруем треки. favoriteTracks из Redux:", favoriteTracks);
    console.log("Всего треков для фильтрации:", tracks.length);
    
    if (favoriteTracks && favoriteTracks.length > 0) {
      const filtered = tracks.filter(track => {
        const trackId = track.id || track._id || 0;
        const isFavorite = favoriteTracks.includes(trackId);
        console.log(`Трек ${trackId} (${track.name}): ${isFavorite ? 'избранный' : 'не избранный'}`);
        return isFavorite;
      });
      
      console.log("Отфильтровано треков:", filtered.length);
      
      return filtered.map((track: Track) => ({
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
    }
    
    console.log("favoriteTracks пуст, фильтруем по stared_user");
    
    return tracks
      .filter(track => {
        if (user && track.stared_user && Array.isArray(track.stared_user)) {
          const isLiked = track.stared_user.some((u: any) => 
            u.id === user.id || u._id === user.id || u === user.id
          );
          console.log(`Трек ${track.id} (${track.name}): ${isLiked ? 'лайкнут пользователем' : 'не лайкнут'}`);
          return isLiked;
        }
        return false;
      })
      .map((track: Track) => ({
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
  }, [favoriteTracks, user]);

  const filterFavoriteTrackObjects = useCallback((tracks: Track[]): Track[] => {
    if (favoriteTracks && favoriteTracks.length > 0) {
      return tracks.filter(track => {
        const trackId = track.id || track._id || 0;
        return favoriteTracks.includes(trackId);
      });
    }
    
    if (user) {
      return tracks.filter(track => {
        if (track.stared_user && Array.isArray(track.stared_user)) {
          return track.stared_user.some((u: any) => 
            u.id === user.id || u._id === user.id || u === user.id
          );
        }
        return false;
      });
    }
    
    return [];
  }, [favoriteTracks, user]);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("=== НАЧАЛО ЗАГРУЗКИ ИЗБРАННОГО ===");
      console.log("Пользователь:", user?.username);
      console.log("Избранные ID из Redux:", favoriteTracks);
      console.log("Длина favoriteTracks:", favoriteTracks?.length || 0);
      
      let favoriteTracksData: Track[] = [];
      
      if (!hasAttemptedDirectLoad) {
        try {
          console.log("Пробуем прямой запрос избранных треков...");
          favoriteTracksData = await trackService.getFavoriteTracks();
          console.log("Прямой запрос успешен! Получено треков:", favoriteTracksData.length);
          setHasAttemptedDirectLoad(true);
        } catch (apiError: any) {
          console.log("Прямой запрос не удался:", apiError.message);
          console.log("Используем альтернативный метод...");
        }
      }
      
      if (favoriteTracksData.length === 0) {
        console.log("Загружаем все треки для фильтрации...");
        const allTracksData = await loadAllTracks();
        console.log("Всего треков загружено:", allTracksData.length);
        
        favoriteTracksData = filterFavoriteTrackObjects(allTracksData);
        console.log("После фильтрации осталось:", favoriteTracksData.length);
      }
      
      console.log("Итоговое количество избранных треков:", favoriteTracksData.length);
      
      const tracksForDisplay: ITrackDisplay[] = favoriteTracksData.map((track: Track) => ({
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
      
      setTracks(tracksForDisplay);
      
      const trackIds = favoriteTracksData.map(track => track.id || track._id || 0);
      console.log("Обновляем Redux с ID треков:", trackIds);
      dispatch(setFavoriteTracks(trackIds));
      
    } catch (err: any) {
      console.error('Ошибка загрузки избранного:', err);
      setError(err.message || 'Ошибка загрузки избранных треков');
    } finally {
      setLoading(false);
      console.log("=== ЗАВЕРШЕНИЕ ЗАГРУЗКИ ИЗБРАННОГО ===");
    }
  }, [user, favoriteTracks, dispatch, loadAllTracks, filterFavoriteTrackObjects, hasAttemptedDirectLoad]);

  const handleUnlike = useCallback(async (trackId: number) => {
    try {
      console.log("Удаление трека из избранного:", trackId);
      await trackService.dislikeTrack(trackId);
      
      setTracks(prev => {
        const newTracks = prev.filter(track => track.id !== trackId);
        console.log("Локальное состояние обновлено, осталось треков:", newTracks.length);
        return newTracks;
      });
      
      const newFavoriteTracks = favoriteTracks.filter(id => id !== trackId);
      dispatch(setFavoriteTracks(newFavoriteTracks));
      console.log("Redux состояние обновлено, осталось ID:", newFavoriteTracks.length);
      
    } catch (err) {
      console.error('Ошибка удаления из избранного:', err);
      setError('Не удалось удалить трек из избранного');
    }
  }, [favoriteTracks, dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    } else {
      loadFavorites();
    }
  }, [isAuthenticated, router, loadFavorites]);

  useEffect(() => {
    console.log("Треки для отображения (tracks состояние):", tracks.length);
    console.log("Избранные ID в Redux (favoriteTracks):", favoriteTracks?.length || 0);
  }, [tracks, favoriteTracks]);

  const emptyState = useMemo(() => (
    <div className={styles.emptyState}>
      <h3>В избранном пока нет треков</h3>
      <p className={styles.emptyStateText}>
        Добавляйте треки в избранное, нажимая на значок ♥ рядом с треками
      </p>
    </div>
  ), []);

  const errorComponent = useMemo(() => (
    error && (
      <div className={styles.errorContainer}>
        <h2>Ошибка</h2>
        <p>{error}</p>
        <button onClick={loadFavorites} className={styles.retryButton}>
          Попробовать снова
        </button>
      </div>
    )
  ), [error, loadFavorites]);

  if (!isAuthenticated) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <p>Перенаправление на страницу входа...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка избранных треков...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Header />
          <div className={styles.centerblock}>
            <SearchBar />
            <h2 className={styles.centerblock__h2}>Мой плейлист</h2>
            
            <div className={styles.contentContainer}>
              {errorComponent}
              
              {!error && tracks.length > 0 ? (
                <>
                  <div className={styles.trackCount}>
                    В избранном {tracks.length} {tracks.length === 1 ? 'трек' : 
                    tracks.length > 1 && tracks.length < 5 ? 'трека' : 'треков'}
                  </div>
                  
                  <div className={styles.favoritesActions}>
                    <button 
                      onClick={() => {
                        console.log("Обновление списка...");
                        loadFavorites();
                      }}
                      className={styles.refreshButton}
                    >
                      Обновить список
                    </button>
                  </div>
                  
                  <div className={styles.playlistWrapper}>
                    <TrackList tracks={tracks} />
                  </div>
                </>
              ) : !error && emptyState}
            </div>
          </div>
          <Sidebar />
        </main>
      </div>
    </div>
  );
}