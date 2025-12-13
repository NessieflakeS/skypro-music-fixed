"use client";

import { useDispatch, useSelector } from "react-redux";
import { setCurrentTrack, togglePlayPause } from "@/store/playerSlice";
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
}

const WORKING_TRACK_IDS = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

export default function TrackItem({ track }: TrackItemProps) {
  const dispatch = useDispatch();
  const playerState = useSelector((state: RootState) => state.player);
  const { currentTrack, isPlaying } = playerState;

  const isCurrentTrack = currentTrack?.id === track.id;
  const isWorkingTrack = WORKING_TRACK_IDS.includes(track.id);

  const handleTrackClick = () => {
    if (!isWorkingTrack) {
      alert("Этот трек не может быть воспроизведен. Пожалуйста, выберите другой трек из списка (Chase, Open Sea epic, и т.д.)");
      return;
    }
    
    if (isCurrentTrack) {
      dispatch(togglePlayPause());
    } else {
      dispatch(setCurrentTrack({
        id: track.id,
        name: track.name,
        author: track.author,
        album: track.album,
        time: track.time,
        track_file: track.track_file || `https://example.com/track${track.id}.mp3`
      }));
    }
  };

  return (
    <div 
      className={`${styles.playlist__item} ${isCurrentTrack ? styles.playlist__item_current : ''} ${!isWorkingTrack ? styles.playlist__item_disabled : ''}`}
      onClick={handleTrackClick}
    >
      <div className={styles.playlist__track}>
        <div className={styles.track__title}>
          <div className={styles.track__titleImage}>
            <svg className={`${styles.track__titleSvg} ${!isWorkingTrack ? styles.track__titleSvg_disabled : ''}`}>
              <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
            </svg>
            {isCurrentTrack && isWorkingTrack && (
              <div className={`${styles.track__titleDot} ${isPlaying ? styles.track__titleDot_playing : ''}`}></div>
            )}
            {!isWorkingTrack && (
              <div className={styles.track__titleDisabled}>
                <svg className={styles.track__titleDisabledSvg}>
                  <use xlinkHref="/img/icon/sprite.svg#icon-lock"></use>
                </svg>
              </div>
            )}
          </div>
          <div className={styles.track__titleText}>
            <span className={`${styles.track__titleLink} ${!isWorkingTrack ? styles.track__titleLink_disabled : ''}`}>
              {track.name} <span className={styles.track__titleSpan}>{track.subtitle || ""}</span>
            </span>
          </div>
        </div>
        <div className={styles.track__author}>
          <span className={`${styles.track__authorLink} ${!isWorkingTrack ? styles.track__authorLink_disabled : ''}`}>
            {track.author}
          </span>
        </div>
        <div className={styles.track__album}>
          <span className={`${styles.track__albumLink} ${!isWorkingTrack ? styles.track__albumLink_disabled : ''}`}>
            {track.album}
          </span>
        </div>
        <div className={styles.track__time}>
          <svg className={`${styles.track__timeSvg} ${!isWorkingTrack ? styles.track__timeSvg_disabled : ''}`}>
            <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
          </svg>
          <span className={`${styles.track__timeText} ${!isWorkingTrack ? styles.track__timeText_disabled : ''}`}>
            {track.time}
          </span>
        </div>
      </div>
    </div>
  );
}