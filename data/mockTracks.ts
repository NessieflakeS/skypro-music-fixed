export interface MockTrack {
  id: number;
  name: string;
  author: string;
  album: string;
  duration_in_seconds: number;
  track_file: string;
  release_date: string;
  genre: string[];
  logo: string | null;
  stared_user: any[];
}

export const mockTracks: MockTrack[] = [
  {
    id: 1,
    name: "Guilt",
    author: "Nero",
    album: "Welcome Reality",
    duration_in_seconds: 180,
    track_file: "https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Alexander_Nakarada_-_Chase.mp3",
    release_date: "2023-01-01",
    genre: ["Rock", "Alternative"],
    logo: null,
    stared_user: []
  },
  {
    id: 2,
    name: "Elektro",
    author: "Dynoro, Outwork, Mr. Gee",
    album: "Elektro",
    duration_in_seconds: 240,
    track_file: "https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Frank_Schroter_-_Open_Sea_epic.mp3",
    release_date: "2023-02-01",
    genre: ["Pop", "Dance"],
    logo: null,
    stared_user: []
  },
];

export const getMockTracks = (): Promise<MockTrack[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTracks);
    }, 500);
  });
};