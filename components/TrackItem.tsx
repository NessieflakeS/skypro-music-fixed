"use client";

import { useDispatch, useSelector } from "react-redux";
import { setCurrentTrack, togglePlayPause } from "../store/playerSlice";
import { RootState } from "../store/store";
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
}

export default function TrackItem({ track }: TrackItemProps) {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector(
    (state: RootState) => state.player
  );

  const isCurrentTrack = currentTrack?.id === track.id;

  const handleTrackClick = () => {
    if (isCurrentTrack) {
      dispatch(togglePlayPause());
    } else {
      dispatch(setCurrentTrack({
        ...track,
        track_file: track.track_file || `https://example.com/track${track.id}.mp3`
      }));
    }
  };

  return (
    <div 
      className={`${styles.playlist__item} ${isCurrentTrack ? styles.playlist__item_current : ''}`}
      onClick={handleTrackClick}
    >
      <div className={styles.playlist__track}>
        <div className={styles.track__title}>
          <div className={styles.track__titleImage}>
            {isCurrentTrack ? (
              <div className={`${styles.track__titleDot} ${isPlaying ? styles.track__titleDot_playing : ''}`}>
                <svg className={styles.track__titleSvg}>
                  <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
                </svg>
              </div>
            ) : (
              <svg className={styles.track__titleSvg}>
                <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
              </svg>
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