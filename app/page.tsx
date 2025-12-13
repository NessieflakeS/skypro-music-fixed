"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import Player from "../components/Player";
import TrackList from "../components/TrackList";
import Filter from "../components/Filter";
import { data } from "../data";
import { ITrack } from "../components/TrackList";
import { setCurrentTrack, setVolume, setCurrentTime } from "../store/playerSlice";
import { RootState } from "../store/store";
import styles from "./page.module.css";

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const tracksForDisplay: ITrack[] = data.map(track => ({
  id: track._id,
  name: track.name,
  author: track.author,
  album: track.album,
  time: formatDuration(track.duration_in_seconds),
  link: "#",
  authorLink: "#",
  albumLink: "#",
  track_file: track.track_file
}));

const workingTracks = tracksForDisplay.filter(track => track.id >= 16 && track.id <= 25);

export default function Home() {
  const dispatch = useDispatch();
  const playerState = useSelector((state: RootState) => state.player);
  const { currentTrack, volume, currentTime, duration } = playerState;
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  }, [dispatch]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    dispatch(setVolume(newVolume));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const progressBarWidth = rect.width;
    const percentage = (clickPosition / progressBarWidth) * 100;
    const newTime = (percentage / 100) * duration;
    
    dispatch(setCurrentTime(newTime));
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Header />
          <div className={styles.centerblock}>
            <SearchBar />
            <h2 className={styles.centerblock__h2}>Треки</h2>
            <Filter tracks={data} />
            <div className={styles.contentContainer}>
              <TrackList tracks={workingTracks} />
            </div>
          </div>
          <Sidebar />
        </main>
        
        {currentTrack && (
          <div className={styles.bar}>
            <div className={styles.bar__content}>
              <div 
                className={styles.bar__playerProgress} 
                ref={progressBarRef}
                onClick={handleProgressClick}
              >
                <div 
                  className={styles.player__progress}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className={styles.bar__playerBlock}>
                <div className={styles.bar__player}>
                  <Player />
                  <div className={styles.trackPlay}>
                    <div className={styles.trackPlay__contain}>
                      <div className={styles.trackPlay__image}>
                        <svg className={styles.trackPlay__svg}>
                          <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
                        </svg>
                      </div>
                      <div className={styles.trackPlay__author}>
                        <span className={styles.trackPlay__authorLink} title={currentTrack?.name}>
                          {currentTrack?.name || "Трек не выбран"}
                        </span>
                      </div>
                      <div className={styles.trackPlay__album}>
                        <span className={styles.trackPlay__albumLink} title={currentTrack?.author}>
                          {currentTrack?.author || "Исполнитель не выбран"}
                        </span>
                      </div>
                    </div>
                    <div className={styles.trackPlay__likeDis}>
                      <div className={styles.trackPlay__like}>
                        <svg className={styles.trackPlay__likeSvg}>
                          <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
                        </svg>
                      </div>
                      <div className={styles.trackPlay__dislike}>
                        <svg className={styles.trackPlay__dislikeSvg}>
                          <use xlinkHref="/img/icon/sprite.svg#icon-dislike"></use>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.bar__volumeBlock}>
                  <div className={styles.volume__content}>
                    <div className={styles.volume__image}>
                      <svg className={styles.volume__svg}>
                        <use xlinkHref="/img/icon/sprite.svg#icon-volume"></use>
                      </svg>
                    </div>
                    <div className={styles.volume__progress}>
                      <input
                        className={styles.volume__progressLine}
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        placeholder="Кнопка увеличения громкости"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <footer className={styles.footer}></footer>
      </div>
    </div>
  );
}