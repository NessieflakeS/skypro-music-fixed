"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import Filter from "../components/Filter";
import TrackList from "../components/TrackList";
import { setCurrentTrack, setVolume, setCurrentTime } from "../store/playerSlice";
import { RootState } from "../store/store";
import { useTracks } from "@/hooks/useTracks";
import styles from "./page.module.css";

export default function Home() {
  const dispatch = useDispatch();
  const playerState = useSelector((state: RootState) => state.player);
  const { currentTrack, volume, currentTime, duration } = playerState;
  
  const { tracks, tracksForDisplay, loading, error, loadTracks } = useTracks();

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

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
            <h2 className={styles.centerblock__h2}>Треки</h2>
            <Filter tracks={tracks} />
            <div className={styles.contentContainer}>
              <TrackList tracks={tracksForDisplay} />
            </div>
          </div>
          <Sidebar />
        </main>
      </div>
    </div>
  );
}