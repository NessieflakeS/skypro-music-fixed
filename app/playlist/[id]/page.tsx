"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import TrackList from "@/components/TrackList";
import Filter from "@/components/Filter";
import { ITrackDisplay } from "@/components/TrackList";
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
  const id = params.id ? Number(params.id) : null;
  
  const [tracks, setTracks] = useState<ITrackDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionName, setSelectionName] = useState("Подборка");

  useEffect(() => {
    if (id && SELECTION_NAMES[id]) {
      setSelectionName(SELECTION_NAMES[id]);
    } else {
      setSelectionName(`Подборка #${id}`);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setError("ID подборки не указан");
      setLoading(false);
      return;
    }

    loadTracks();
  }, [id]);

  const loadTracks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await trackService.getSelectionTracks(id!);
      
      const tracksForDisplay: ITrackDisplay[] = data.map(track => ({
        id: track.id || track._id || 0,
        name: track.name || "Без названия",
        author: track.author || "Неизвестный исполнитель",
        album: track.album || "Без альбома",
        time: formatDuration(track.duration_in_seconds),
        link: "#",
        authorLink: "#",
        albumLink: "#",
        track_file: track.track_file || "",
        genre: track.genre?.[0] || "",
        release_date: track.release_date || "",
      }));
      
      setTracks(tracksForDisplay);
    } catch (err: any) {
      console.error('Ошибка загрузки треков подборки:', err);
      setError(err.response?.data?.detail || err.message || 'Ошибка загрузки треков подборки');
    } finally {
      setLoading(false);
    }
  };

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
            <Filter tracks={tracks} />
            <div className={styles.contentContainer}>
              {tracks.length > 0 ? (
                <TrackList tracks={tracks} />
              ) : (
                <div className={styles.emptyState}>
                  <h3>В этой подборке пока нет треков</h3>
                  <p>Попробуйте другую подборку</p>
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