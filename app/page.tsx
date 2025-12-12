"use client";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import Player from "../components/Player";
import TrackList from "../components/TrackList";
import Filter from "../components/Filter";
import { data } from "@/data";
import styles from "./page.module.css";

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const tracksForDisplay = data.map(track => ({
  id: track._id,
  name: track.name,
  author: track.author,
  album: track.album,
  time: formatDuration(track.duration_in_seconds),
  link: "#",
  authorLink: "#",
  albumLink: "#"
}));

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.centerblock}>
            <SearchBar />
            <h2 className={styles.centerblock__h2}>Треки</h2>
            <Filter tracks={data} />
            <TrackList tracks={tracksForDisplay} />
          </div>
          <Sidebar />
        </main>
        <div className={styles.bar}>
          <div className={styles.bar__content}>
            <div className={styles.bar__playerProgress}></div>
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
                      <a className={styles.trackPlay__authorLink} href="#">
                        {tracksForDisplay[0]?.name || "Трек не выбран"}
                      </a>
                    </div>
                    <div className={styles.trackPlay__album}>
                      <a className={styles.trackPlay__albumLink} href="#">
                        {tracksForDisplay[0]?.author || "Исполнитель не выбран"}
                      </a>
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
                      name="range"
                      placeholder="Кнопка увеличения громкости"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className={styles.footer}></footer>
      </div>
    </div>
  );
}