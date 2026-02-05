"use client";

import { useEffect, useState } from "react";
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

export default function PlaylistPage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  
  const [tracks, setTracks] = useState<ITrackDisplay[]>([]);
  const [rawTracks, setRawTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionName, setSelectionName] = useState("Подборка");

  useEffect(() => {
    if (!id) {
      setError("ID подборки не указан");
      setLoading(false);
      return;
    }

    loadTracks();
  }, [id]);

  const loadTracks = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const tracksData: Track[] = await trackService.getSelectionTracks(id!);
      
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
      
      setSelectionName(`Подборка #${id}`);
      
    } catch (err: any) {
      console.error('Ошибка загрузки подборки:', err);
      setError(err.message || 'Ошибка загрузки подборки');
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
            <Link href="/" style={{ marginTop: '10px', display: 'inline-block' }}>
              <button className={styles.retryButton} style={{ backgroundColor: '#696969' }}>
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
                  <div style={{ 
                    marginBottom: '20px', 
                    color: '#696969',
                    fontSize: '14px'
                  }}>
                    В подборке {tracks.length} треков
                  </div>
                  <TrackList tracks={tracks} />
                </>
              ) : (
                <div className={styles.emptyState}>
                  <h3>В этой подборке пока нет треков</h3>
                  <p style={{ color: '#ffffff', marginBottom: '20px' }}>Попробуйте другую подборку или перейдите на главную страницу</p>
                  <Link href="/" style={{ 
                    display: 'inline-block', 
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#ad61ff',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none'
                  }}>
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