export interface ITrack {
  _id: number | string;
  name: string;
  author: string;
  album: string;
  release_date: string;
  genre: string[];
  duration_in_seconds: number;
  logo: string | null;
  track_file: string;
  stared_user: any[];
}

export interface ITrackDisplay extends Omit<ITrack, '_id' | 'duration_in_seconds'> {
  id: number | string;
  time: string;
  link?: string;
  authorLink?: string;
  albumLink?: string;
  subtitle?: string;
}

export interface IUser {
  id: number | string;
  username: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  user: IUser;
}

export type FilterType = "author" | "year" | "genre" | null;