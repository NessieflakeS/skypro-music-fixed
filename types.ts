export interface Track {
  _id: number;
  name: string;
  author: string;
  release_date: string;
  genre: string[];
  duration_in_seconds: number;
  album: string;
  logo: string | null;
  track_file: string;
  stared_user: any[];
}

export interface ITrackDisplay {
  id: number;
  name: string;
  author: string;
  album: string;
  release_date: string;
  genre: string[];
  duration_in_seconds: number;
  track_file: string;
  time: string;
  link?: string;
  authorLink?: string;
  albumLink?: string;
  subtitle?: string;
}

export type FilterType = "author" | "year" | "genre" | null;