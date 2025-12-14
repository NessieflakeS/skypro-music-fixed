"use client";

import { useDispatch, useSelector } from "react-redux";
import { setCurrentTrack } from "@/store/playerSlice";
import { RootState } from "@/store/store";
import styles from "./TrackItem.module.css";

interface ITrack {
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

interface TrackItemProps {
  track: ITrack;
  playlist: ITrack[];
}

export default function TrackItem({ track, playlist }: TrackItemProps) {
  const dispatch = useDispatch();
  const playerState = useSelector((state: RootState) => state.player);
  const { currentTrack, isPlaying } = playerState;

  const isCurrentTrack = currentTrack?.id === track.id;

  const handleTrackClick = () => {
    if (isCurrentTrack) {
      return;
    }
    
    dispatch(setCurrentTrack({
      track: {
        id: track.id,
        name: track.name,
        author: track.author,
        album: track.album,
        time: track.time,
        track_file: track.track_file
      },
      playlist: playlist
    }));
  };

  return (
    <div 
      className={`${styles.playlist__item} ${isCurrentTrack ? styles.playlist__item_current : ''}`}
      onClick={handleTrackClick}
    >
      <div className={styles.playlist__track}>
        <div className={styles.track__title}>
          <div className={styles.track__titleImage}>
            <svg className={styles.track__titleSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
            </svg>
            {isCurrentTrack && (
              <div className={`${styles.track__titleDot} ${isPlaying ? styles.track__titleDot_playing : ''}`}></div>
            )}
          </div>
          <div className={styles.track__titleText}>
            <span className={styles.track__titleLink}>
              {track.name} <span className={styles.track__titleSpan}>{track.subtitle || ""}</span>
            </span>
          </div>
        </div>
        <div className={styles.track__author}>
          <span className={styles.track__authorLink}>
            {track.author}
          </span>
        </div>
        <div className={styles.track__album}>
          <span className={styles.track__albumLink}>
            {track.album}
          </span>
        </div>
        <div className={styles.track__time}>
          <svg className={styles.track__timeSvg}>
            <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
          </svg>
          <span className={styles.track__timeText}>{track.time}</span>
        </div>
      </div>
    </div>
  );
}