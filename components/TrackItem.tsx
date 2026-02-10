"use client";

import { useCallback, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentTrack, togglePlayPause } from "@/store/playerSlice";
import { RootState } from "@/store/store";
import { ITrackDisplay } from "@/types";
import LikeButton from "./LikeButton";
import styles from "./TrackItem.module.css";

interface TrackItemProps {
  track: ITrackDisplay;
  playlist: ITrackDisplay[];
}

const TrackItem = memo(function TrackItem({ track, playlist }: TrackItemProps) {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state: RootState) => state.player);

  const isCurrent = currentTrack?.id === track.id;
  const isPlayingCurrent = isCurrent && isPlaying;

  const handleTrackClick = useCallback(() => {
    if (isCurrent) {
      dispatch(togglePlayPause());
    } else {
      dispatch(setCurrentTrack({
        track: {
          id: track.id,
          name: track.name,
          author: track.author,
          album: track.album,
          track_file: track.track_file,
          time: track.time
        },
        playlist: playlist.map(t => ({
          id: t.id,
          name: t.name,
          author: t.author,
          album: t.album,
          track_file: t.track_file,
          time: t.time
        }))
      }));
    }
  }, [dispatch, isCurrent, track, playlist]);

  return (
    <div 
      className={`${styles.playlist__item} ${isCurrent ? styles.playlist__item_current : ''}`}
      onClick={handleTrackClick}
    >
      <div className={styles.playlist__track}>
        <div className={styles.track__title}>
          <div className={styles.track__titleImage}>
            <svg className={styles.track__titleSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
            </svg>
            {isCurrent && (
              <div className={`${styles.track__titleDot} ${isPlayingCurrent ? styles.track__titleDot_playing : ''}`}></div>
            )}
          </div>
          <div className={styles.track__titleText}>
            <span className={styles.track__titleLink}>
              {track.name}
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
          <div className={styles.likeButtonWrapper}>
            <LikeButton 
              trackId={track.id} 
              size="small"
              showCount={false}
            />
          </div>
          <span className={styles.track__timeText}>{track.time}</span>
        </div>
      </div>
    </div>
  );
});

export default TrackItem;