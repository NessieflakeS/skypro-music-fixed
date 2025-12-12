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
}

interface TrackItemProps {
  track: ITrack;
}

export default function TrackItem({ track }: TrackItemProps) {
  return (
    <div className={styles.playlist__item}>
      <div className={styles.playlist__track}>
        <div className={styles.track__title}>
          <div className={styles.track__titleImage}>
            <svg className={styles.track__titleSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
            </svg>
          </div>
          <div className={styles.track__titleText}>
            <a className={styles.track__titleLink} href={track.link || "#"}>
              {track.name} <span className={styles.track__titleSpan}>{track.subtitle || ""}</span>
            </a>
          </div>
        </div>
        <div className={styles.track__author}>
          <a className={styles.track__authorLink} href={track.authorLink || "#"}>
            {track.author}
          </a>
        </div>
        <div className={styles.track__album}>
          <a className={styles.track__albumLink} href={track.albumLink || "#"}>
            {track.album}
          </a>
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