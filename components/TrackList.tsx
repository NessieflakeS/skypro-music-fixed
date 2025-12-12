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
}

interface TrackListProps {
  tracks?: ITrack[];
}

const defaultTracks: ITrack[] = [
  {
    id: 1,
    name: "Guilt",
    author: "Nero",
    album: "Welcome Reality",
    time: "4:44",
    link: "#",
    authorLink: "#",
    albumLink: "#"
  },
  {
    id: 2,
    name: "Elektro",
    author: "Dynoro, Outwork, Mr. Gee",
    album: "Elektro",
    time: "2:22",
    link: "#",
    authorLink: "#",
    albumLink: "#"
  },
  {
    id: 3,
    name: "I'm Fire",
    author: "Ali Bakgor",
    album: "I'm Fire",
    time: "2:22",
    link: "#",
    authorLink: "#",
    albumLink: "#"
  }
];

export default function TrackList({ tracks = defaultTracks }: TrackListProps) {
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
      <div className={styles.content__playlist}>
        {tracks.map((track) => (
          <TrackItem key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
}