"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useFilters } from "@/hooks/useFilters";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import Filter from "@/components/Filter";
import TrackList from "@/components/TrackList";
import { trackService } from "@/services/trackService";
import { Track, ITrackDisplay } from "@/types";
import { RootState } from "@/store/store";
import { formatDuration } from "@/utils/formatTime";
import styles from "@/app/page.module.css";

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [rawTracks, setRawTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const isLoadingRef = useRef(false);

  const {
    filters,
    filteredTracks,
    availableAuthors,
    availableGenres,
    setSearchQuery,
    toggleAuthor,
    toggleGenre,
    setSortBy,
  } = useFilters(rawTracks);

  const loadFavorites = useCallback(async () => {
    if (isLoadingRef.current) return;
    if (!isAuthenticated) {
      router.push("/signin?redirect=/favorites");
      return;
    }

    isLoadingRef.current = true;
    try {
      setLoading(true);
      setError(null);
      const favoriteTracksData = await trackService.getFavoriteTracks();
      setRawTracks(favoriteTracksData);
    } catch (err: any) {
      console.error("Ошибка загрузки избранного:", err);
      setError(err.message || "Ошибка загрузки избранных треков");
      if (err.response?.status === 401) {
        router.push("/signin?redirect=/favorites");
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites, retryCount]);

  const displayTracks: ITrackDisplay[] = filteredTracks.map((track) => ({
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
            <SearchBar value={filters.searchQuery} onChange={setSearchQuery} />
            <h2 className={styles.centerblock__h2}>Мои треки</h2>
            <Filter
              authors={availableAuthors}
              genres={availableGenres}
              selectedAuthors={filters.selectedAuthors}
              selectedGenres={filters.selectedGenres}
              sortBy={filters.sortBy}
              onToggleAuthor={toggleAuthor}
              onToggleGenre={toggleGenre}
              onSortChange={setSortBy}
            />
            <div className={styles.contentContainer}>
              {error ? (
                <div className={styles.errorContainer}>
                  <h2>Ошибка</h2>
                  <p>{error}</p>
                  <button
                    onClick={() => {
                      setRetryCount((prev) => prev + 1);
                      setError(null);
                    }}
                    className={styles.retryButton}
                  >
                    Попробовать снова
                  </button>
                </div>
              ) : displayTracks.length > 0 ? (
                <>
                  <div className={styles.trackCount}>
                    В избранном {displayTracks.length}{" "}
                    {displayTracks.length === 1
                      ? "трек"
                      : displayTracks.length > 1 && displayTracks.length < 5
                      ? "трека"
                      : "треков"}
                  </div>
                  <div className={styles.favoritesActions}>
                    <button
                      onClick={() => {
                        trackService.clearCache();
                        setRetryCount((prev) => prev + 1);
                      }}
                      className={styles.refreshButton}
                    >
                      Обновить список
                    </button>
                  </div>
                  <TrackList tracks={displayTracks} />
                </>
              ) : (
                <div className={styles.emptyState}>
                  <h3>В избранном пока нет треков</h3>
                  <p className={styles.emptyStateText}>
                    Добавляйте треки в избранное, нажимая на значок ♥ рядом с
                    треками
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