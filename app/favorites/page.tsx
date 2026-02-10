"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react"; 
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
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [tracks, setTracks] = useState<ITrackDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const isLoadingRef = useRef(false);

  const loadFavorites = useCallback(async () => {
    if (isLoadingRef.current) {
      console.log('Загрузка уже выполняется, пропускаем...');
      return;
    }
    
    if (!isAuthenticated) {
      console.log('Пользователь не авторизован, редирект на signin');
      router.push('/signin?redirect=/favorites');
      return;
    }
    
    isLoadingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Загрузка избранных треков...');
      const favoriteTracksData = await trackService.getFavoriteTracks();
      console.log(`Получено ${favoriteTracksData.length} избранных треков`);
      
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
      
      if (err.response?.status === 401 || err.message?.includes('Сессия истекла')) {
        router.push('/signin?redirect=/favorites');
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites, retryCount]);

  if (!isAuthenticated && loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <p>Проверка авторизации...</p>
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
              {error ? (
                <div className={styles.errorContainer}>
                  <h2>Ошибка</h2>
                  <p>{error}</p>
                  <button 
                    onClick={() => {
                      setRetryCount(prev => prev + 1);
                      setError(null);
                    }} 
                    className={styles.retryButton}
                  >
                    Попробовать снова
                  </button>
                </div>
              ) : tracks.length > 0 ? (
                <>
                  <div className={styles.trackCount}>
                    В избранном {tracks.length} {tracks.length === 1 ? 'трек' : 
                    tracks.length > 1 && tracks.length < 5 ? 'трека' : 'треков'}
                  </div>
                  
                  <div className={styles.favoritesActions}>
                    <button 
                      onClick={() => {
                        trackService.clearCache();
                        setRetryCount(prev => prev + 1);
                      }}
                      className={styles.refreshButton}
                    >
                      Обновить список
                    </button>
                  </div>
                  
                  <TrackList tracks={tracks} />
                </>
              ) : (
                <div className={styles.emptyState}>
                  <h3>В избранном пока нет треков</h3>
                  <p className={styles.emptyStateText}>
                    Добавляйте треки в избранное, нажимая на значок ♥ рядом с треками
                  </p>
                </div>
              )}
            </div>
          </div>
          <Sidebar />
        </main>
      </div>
    </div>
  );
}