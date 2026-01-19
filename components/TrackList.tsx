"use client";

import { useRef, useState, useEffect } from "react";
import TrackItem from "./TrackItem";
import styles from "./TrackList.module.css";

export interface ITrack {
  id: number;
  name: string;
  author: string;
  album: string;
  time: string;
  link?: string;
  authorLink?: string;
  albumLink?: string;
  subtitle?: string;
  track_file?: string;
}

interface TrackListProps {
  tracks?: ITrack[];
}

export default function TrackList({ tracks = [] }: TrackListProps) {
  const playlistRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const handleScroll = () => {
    if (playlistRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = playlistRef.current;
      const isBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 1;
      setIsScrolledToBottom(isBottom);
    }
  };

  useEffect(() => {
    const element = playlistRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      handleScroll();
      
      return () => {
        element.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return (
    <div className={styles.centerblock__content}>
      <div className={styles.content__title}>
        <div className={`${styles.playlistTitle__col} ${styles.col01}`}>Трек</div>
        <div className={`${styles.playlistTitle__col} ${styles.col02}`}>Исполнитель</div>
        <div className={`${styles.playlistTitle__col} ${styles.col03}`}>Альбом</div>
        <div className={`${styles.playlistTitle__col} ${styles.col04}`}>
          <svg className={styles.playlistTitle__svg}>
            <use xlinkHref="/img/icon/sprite.svg#icon-watch"></use>
          </svg>
        </div>
      </div>
      <div 
        ref={playlistRef}
        className={`${styles.content__playlist} ${isScrolledToBottom ? styles.scrolled_to_bottom : ''}`}
      >
        {tracks.map((track) => (
          <TrackItem key={track.id} track={track} playlist={tracks} />
        ))}
      </div>
    </div>
  );
}