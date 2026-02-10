"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import TrackItem from "./TrackItem";
import styles from "./TrackList.module.css";
import { ITrackDisplay } from "@/types"; 

interface TrackListProps {
  tracks?: ITrackDisplay[];
}

export default function TrackList({ tracks = [] }: TrackListProps) {
  const playlistRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  
  console.log("TrackList получил треков:", tracks.length);
  if (tracks.length > 0) {
    console.log("Пример трека:", tracks[0]);
  }

  const filteredTracks = useMemo(() => {
    console.log("Фильтрация треков в TrackList:", tracks.length);
    return tracks;
  }, [tracks]);

  const handleScroll = useCallback(() => {
    if (playlistRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = playlistRef.current;
      const isBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 1;
      setIsScrolledToBottom(isBottom);
    }
  }, []);

  useEffect(() => {
    const element = playlistRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      handleScroll();
      
      return () => {
        element.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  const playlistClassName = useMemo(() => 
    `${styles.content__playlist} ${isScrolledToBottom ? styles.scrolled_to_bottom : ''}`,
    [isScrolledToBottom]
  );

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
        className={playlistClassName}
      >
        {filteredTracks.length > 0 ? (
          filteredTracks.map((track, index) => (
            <TrackItem 
              key={track.id ? `${track.id}-${index}` : index} 
              track={track} 
              playlist={filteredTracks} 
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>Нет треков для отображения</p>
          </div>
        )}
      </div>
    </div>
  );
}