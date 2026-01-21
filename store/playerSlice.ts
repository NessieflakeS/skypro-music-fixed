import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerTrack {
  id: number;
  name: string;
  author: string;
  album: string;
  track_file?: string;
  time?: string;
}

interface PlayerState {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
  currentTime: number;
  duration: number;
  playlist: PlayerTrack[];
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  volume: 0.5,
  shuffle: false,
  repeat: false,
  currentTime: 0,
  duration: 0,
  playlist: [],
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<{track: PlayerTrack, playlist: PlayerTrack[]}>) => {
      state.currentTrack = action.payload.track;
      state.playlist = action.payload.playlist;
      state.isPlaying = true;
      state.currentTime = 0;
    },
    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },
    toggleRepeat: (state) => {
      state.repeat = !state.repeat;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setNextTrack: (state) => {
      if (!state.currentTrack || state.playlist.length === 0) return;

      const currentIndex = state.playlist.findIndex(track => track.id === state.currentTrack?.id);
      let nextIndex = currentIndex + 1;

      if (state.shuffle) {
        nextIndex = Math.floor(Math.random() * state.playlist.length);
      } else if (nextIndex >= state.playlist.length) {
        nextIndex = 0;
      }

      state.currentTrack = state.playlist[nextIndex];
      state.currentTime = 0;
    },
    setPrevTrack: (state) => {
      if (!state.currentTrack || state.playlist.length === 0) return;

      const currentIndex = state.playlist.findIndex(track => track.id === state.currentTrack?.id);
      let prevIndex = currentIndex - 1;

      if (state.shuffle) {
        prevIndex = Math.floor(Math.random() * state.playlist.length);
      } else if (prevIndex < 0) {
        prevIndex = state.playlist.length - 1;
      }

      state.currentTrack = state.playlist[prevIndex];
      state.currentTime = 0;
    },
  },
});

export const {
  setCurrentTrack,
  togglePlayPause,
  setVolume,
  toggleShuffle,
  toggleRepeat,
  setCurrentTime,
  setDuration,
  setNextTrack,
  setPrevTrack,
} = playerSlice.actions;

export default playerSlice.reducer;