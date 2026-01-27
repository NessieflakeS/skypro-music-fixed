export interface Track {
  id: number;
  _id?: number; 
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
  time: string;
  track_file: string;
  link?: string;
  authorLink?: string;
  albumLink?: string;
  subtitle?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export type FilterType = "author" | "year" | "genre" | null;

export interface Selection {
  id: number;
  name: string;
  items: Track[];
  tracks?: Track[];
}