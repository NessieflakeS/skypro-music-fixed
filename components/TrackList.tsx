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
  },
  {
    id: 4,
    name: "Non Stop",
    subtitle: "(Remix)",
    author: "Стоункат, Psychopath",
    album: "Non Stop",
    time: "4:12",
    link: "#",
    authorLink: "#",
    albumLink: "#"
  },
  {
    id: 5,
    name: "Run Run",
    subtitle: "(feat. AR/CO)",
    author: "Jaded, Will Clarke, AR/CO",
    album: "Run Run",
    time: "2:54",
    link: "#",
    authorLink: "#",
    albumLink: "#"
  },
  {
    id: 6,
    name: "Eyes on Fire",
    author: "Blue Foundation",
    album: "Eyes on Fire",
    time: "5:56",
    link: "#",
    authorLink: "#",
    albumLink: "#"
  },
  {
    id: 7,
    name: "Mucho Bien",
    author: "Hyperbit",
    album: "Mucho Bien",
    time: "3:41",
    link: "#",
    authorLink: "#",
    albumLink: "#"
  },
  {
    id: 8,
    name: "Knives n Cherries",
    author: "DVRST",
    album: "Knives n Cherries",
    time: "4:01",
    link: "#",
    authorLink: "#",
    albumLink: "#"
  },
  {
    id: 9,
    name: "How Deep Is Your Love",
    author: "Calvin Harris, Disciples",
    album: "How Deep Is Your Love",
    time: "3:32",
    link: "#",
    authorLink: "#",
    albumLink: "#"
  },
  {
    id: 10,
    name: "Morena",
    author: "Tungevaag",
    album: "Morena",
    time: "3:19",
    link: "#",
    authorLink: "#",
    albumLink: "#"
  },
  {
    id: 11,
    name: "Levitating",
    author: "Dua Lipa",
    album: "Future Nostalgia",
    time: "3:24",
    link: "#",
    authorLink: "#",
    albumLink: "#"
  },
  {
    id: 12,
    name: "Blinding Lights",
    author: "The Weeknd",
    album: "After Hours",
    time: "3:22",
    link: "#",
    authorLink: "#",
    albumLink: "#"
  },
  {
    id: 13,
    name: "Stay",
    author: "The Kid LAROI, Justin Bieber",
    album: "F*CK LOVE 3",
    time: "2:21",
    link: "#",
    authorLink: "#",
    albumLink: "#"
  },
  {
    id: 14,
    name: "Good 4 U",
    author: "Olivia Rodrigo",
    album: "SOUR",
    time: "2:58",
    link: "#",
    authorLink: "#",
    albumLink: "#"
  },
  {
    id: 15,
    name: "Industry Baby",
    author: "Lil Nas X, Jack Harlow",
    album: "MONTERO",
    time: "3:32",
    link: "#",
    authorLink: "#",
    albumLink: "#"
  }
];

export default function TrackList({ tracks = defaultTracks }: TrackListProps) {
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
          <TrackItem key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
}