"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import TrackList from "@/components/TrackList";
import { trackService } from "@/services/trackService";
import { Track, ITrackDisplay } from "@/types";
import { RootState } from "@/store/store";
import styles from "@/app/page.module.css";

const formatDuration = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, favoriteTracks } = useSelector((state: RootState) => state.user);
  const [tracks, setTracks] = useState<ITrackDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const favoriteTracksData = await trackService.getFavoriteTracks();
      
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
    } catch (err: any) {
      console.error('Ошибка загрузки избранного:', err);
      setError(err.message || 'Ошибка загрузки избранных треков');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUnlike = useCallback(async (trackId: number) => {
    try {
      setTracks(prev => prev.filter(track => track.id !== trackId));
    } catch (err) {
      console.error('Ошибка удаления из избранного:', err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    } else {
      loadFavorites();
    }
  }, [isAuthenticated, router, loadFavorites]);

  // Синхронизация при изменении favoriteTracks
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [favoriteTracks, isAuthenticated, loadFavorites]);

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
            <h2 className={styles.centerblock__h2}>Мои треки</h2>
            
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
                      onClick={() => loadFavorites()}
                      className={styles.refreshButton}
                    >
                      Обновить список
                    </button>
                  </div>
                  
                  <TrackList tracks={tracks} />
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