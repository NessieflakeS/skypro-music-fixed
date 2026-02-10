"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import TrackList from "@/components/TrackList";
import Filter from "@/components/Filter";
import { ITrackDisplay, Track } from "@/types";
import { trackService } from "@/services/trackService";
import styles from "@/app/page.module.css";

const formatDuration = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const SELECTION_NAMES: { [key: number]: string } = {
  1: "Плейлист дня",
  2: "100 танцевальных хитов", 
  3: "Инди-заряд",
};

export default function PlaylistPage() {
  const params = useParams();
  const playlistId = params.id ? Number(params.id) : null;
  
  const [tracks, setTracks] = useState<ITrackDisplay[]>([]);
  const [rawTracks, setRawTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionName, setSelectionName] = useState("Подборка");

  useEffect(() => {
    if (playlistId && SELECTION_NAMES[playlistId]) {
      setSelectionName(SELECTION_NAMES[playlistId]);
    } else if (playlistId) {
      setSelectionName(`Подборка #${playlistId}`);
    }
  }, [playlistId]);

  const loadAllTracks = useCallback(async (): Promise<Track[]> => {
    try {
      const data = await trackService.getAllTracks();
      setRawTracks(data);
      return data;
    } catch (err: any) {
      console.error('Ошибка загрузки всех треков:', err);
      throw err;
    }
  }, []);

  const loadTracks = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      if (playlistId && SELECTION_NAMES[playlistId]) {
        setSelectionName(SELECTION_NAMES[playlistId]);
      } else if (playlistId) {
        setSelectionName(`Подборка #${playlistId}`);
      }
      
      let tracksData: Track[] = [];
      try {
        tracksData = await trackService.getSelectionTracks(playlistId!);
      } catch (apiError) {
        console.log('Не удалось получить треки подборки, используем все треки');
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
      
      const tracksForDisplay: ITrackDisplay[] = tracksData.map((track: Track) => ({
        id: track.id || track._id || 0,
        name: track.name || "Без названия",
        author: track.author || "Неизвестный исполнитель",
        album: track.album || "Без альбома",
        time: formatDuration(track.duration_in_seconds || 0),
        link: "#",
        authorLink: "#",
        albumLink: "#",
        track_file: track.track_file || "",
        genre: track.genre || [],
        release_date: track.release_date || "",
      }));
      
      setTracks(tracksForDisplay);
      
    } catch (err: any) {
      console.error('Ошибка загрузки подборки:', err);
      setError(err.message || 'Ошибка загрузки подборки');
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    if (!playlistId) {
      setError("ID подборки не указан");
      setLoading(false);
      return;
    }

    loadTracks();
  }, [playlistId, loadTracks]);

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
            <SearchBar />
            <h2 className={styles.centerblock__h2}>{selectionName}</h2>
            <Filter tracks={rawTracks} />
            <div className={styles.contentContainer}>
              {tracks.length > 0 ? (
                <>
                  <div className={styles.trackCount}>
                    В подборке {tracks.length} треков
                  </div>
                  <TrackList tracks={tracks} />
                </>
              ) : (
                <div className={styles.emptyState}>
                  <h3>В этой подборке пока нет треков</h3>
                  <p className={styles.emptyStateText}>
                    Попробуйте другую подборку или перейдите на главную страницу
                  </p>
                  <Link href="/" className={styles.emptyStateLink}>
                    На главную
                  </Link>
                </div>
              )}
            </div>
          </div>
          <Sidebar />
        </main>
        <footer className={styles.footer}></footer>
      </div>
    </div>
  );
}