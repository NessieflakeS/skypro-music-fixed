"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import TrackList from "@/components/TrackList";
import Filter from "@/components/Filter";
import { trackService } from "@/services/trackService";
import { Track, ITrackDisplay } from "@/types"; 
import styles from "@/app/page.module.css";

const getMockTracks = (): Promise<Track[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "Mock Track 1",
          author: "Mock Author 1",
          album: "Mock Album 1",
          duration_in_seconds: 180,
          track_file: "https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Alexander_Nakarada_-_Chase.mp3",
          release_date: "2023-01-01",
          genre: ["Rock"],
          logo: null,
          stared_user: []
        },
        {
          id: 2,
          name: "Mock Track 2",
          author: "Mock Author 2",
          album: "Mock Album 2",
          duration_in_seconds: 240,
          track_file: "https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Frank_Schroter_-_Open_Sea_epic.mp3",
          release_date: "2023-02-01",
          genre: ["Pop"],
          logo: null,
          stared_user: []
        }
      ]);
    }, 500);
  });
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
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
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [displayTracks, setDisplayTracks] = useState<ITrackDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionName, setSelectionName] = useState("Подборка");

  useEffect(() => {
    if (id && SELECTION_NAMES[id]) {
      setSelectionName(SELECTION_NAMES[id]);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    loadTracks();
  }, [id]);

  const loadTracks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await trackService.getSelectionTracks(id!);
      
      setTracks(data);
      
      const tracksForDisplay: ITrackDisplay[] = data.map(track => ({
        id: track._id || track.id,
        name: track.name,
        author: track.author,
        album: track.album,
        time: formatDuration(track.duration_in_seconds),
        track_file: track.track_file,
        link: "#",
        authorLink: "#",
        albumLink: "#",
      }));
      
      setDisplayTracks(tracksForDisplay);
    } catch (err: any) {
      console.error('Ошибка загрузки треков подборки:', err);
      
      const mockData = await getMockTracks();
      setTracks(mockData);
      
      const tracksForDisplay: ITrackDisplay[] = mockData.map((track: Track) => ({
        id: track.id,
        name: track.name,
        author: track.author,
        album: track.album,
        time: formatDuration(track.duration_in_seconds),
        track_file: track.track_file,
        link: "#",
        authorLink: "#",
        albumLink: "#",
      }));
      
      setDisplayTracks(tracksForDisplay);
      setError('Не удалось загрузить треки подборки. Используются демо-данные.');
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

  if (error && displayTracks.length === 0) {
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
              {displayTracks.length > 0 ? (
                <TrackList tracks={displayTracks} />
              ) : (
                <div className={styles.emptyPlaylist}>
                  <p>В этой подборке пока нет треков</p>
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