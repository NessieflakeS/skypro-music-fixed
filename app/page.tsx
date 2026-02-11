"use client";

import { useEffect } from "react";
import { useTracks } from "@/hooks/useTracks";
import { useFilters } from "@/hooks/useFilters";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import Filter from "@/components/Filter";
import TrackList from "@/components/TrackList";
import { formatDuration } from "@/utils/formatTime";
import styles from "./page.module.css";

export default function Home() {
  const { tracks, loading, error, loadTracks } = useTracks();
  const {
    filters,
    filteredTracks,
    availableAuthors,
    availableGenres,
    setSearchQuery,
    toggleAuthor,
    toggleGenre,
    setSortBy,
  } = useFilters(tracks);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  const displayTracks = filteredTracks.map((track) => ({
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

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка треков...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <main className={styles.main}>
            <Header />
            <div className={styles.centerblock}>
              <SearchBar value={filters.searchQuery} onChange={setSearchQuery} />
              <h2 className={styles.centerblock__h2}>Треки</h2>
              <div className={styles.errorContainer}>
                <h2>Ошибка загрузки</h2>
                <p>{error}</p>
                <button onClick={loadTracks} className={styles.retryButton}>
                  Попробовать снова
                </button>
              </div>
            </div>
            <Sidebar />
          </main>
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
            <h2 className={styles.centerblock__h2}>Треки</h2>
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
              {displayTracks.length > 0 ? (
                <TrackList tracks={displayTracks} />
              ) : (
                <div className={styles.emptyState}>
                  <h3>Нет подходящих треков</h3>
                  <p className={styles.emptyStateText}>
                    Попробуйте изменить параметры фильтрации
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