"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFilters } from "@/hooks/useFilters";
import Header from "@/components/layout/Header/Header";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import SearchBar from "@/components/ui/SearchBar/SearchBar";
import Filter from "@/components/ui/Filter/Filter";
import TrackList from "@/components/track/TrackList/TrackList";
import { trackService } from "@/services/trackService";
import { Track, ITrackDisplay } from "@/types/index";
import { formatDuration } from "@/utils/formatTime";
import styles from "@/app/page.module.css";

const SELECTION_NAMES: { [key: number]: string } = {
  1: "Плейлист дня",
  2: "100 танцевальных хитов",
  3: "Инди-заряд",
};

export default function PlaylistPage() {
  const params = useParams();
  const playlistId = params.id ? Number(params.id) : null;

  const [rawTracks, setRawTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionName, setSelectionName] = useState("Подборка");

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

  useEffect(() => {
    if (playlistId && SELECTION_NAMES[playlistId]) {
      setSelectionName(SELECTION_NAMES[playlistId]);
    } else if (playlistId) {
      setSelectionName(`Подборка #${playlistId}`);
    }
  }, [playlistId]);

  const loadTracks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!playlistId) {
        setError("ID подборки не указан");
        return;
      }

      let tracksData: Track[] = [];
      try {
        tracksData = await trackService.getSelectionTracks(playlistId);
      } catch (apiError) {
        console.log("Не удалось получить треки подборки, используем заглушку");
        const allTracks = await trackService.getAllTracks();
        if (playlistId === 1) {
          tracksData = allTracks.slice(0, 8);
        } else if (playlistId === 2) {
          tracksData = allTracks.slice(8, 16);
        } else if (playlistId === 3) {
          tracksData = allTracks.slice(16, 24);
        } else {
          tracksData = allTracks.slice(0, 8);
        }
      }

      setRawTracks(tracksData);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки подборки");
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    if (playlistId) {
      loadTracks();
    }
  }, [playlistId, loadTracks]);

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

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка подборки...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.errorContainer}>
            <h2>Ошибка</h2>
            <p>{error}</p>
            <button onClick={loadTracks} className={styles.retryButton}>
              Попробовать снова
            </button>
            <Link href="/" className={styles.homeLink}>
              <button className={`${styles.retryButton} ${styles.homeButton}`}>
                На главную
              </button>
            </Link>
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
            <h2 className={styles.centerblock__h2}>{selectionName}</h2>
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
                <>
                  <div className={styles.trackCount}>
                    В подборке {displayTracks.length}{" "}
                    {displayTracks.length === 1 ? "трек" : "треков"}
                  </div>
                  <TrackList tracks={displayTracks} />
                </>
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