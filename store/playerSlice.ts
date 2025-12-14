import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
  currentTrack: any | null;
  isPlaying: boolean;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
  currentTime: number;
  duration: number;
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  volume: 0.5,
  shuffle: false,
  repeat: false,
  currentTime: 0,
  duration: 0,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<any>) => {
      state.currentTrack = action.payload;
      state.isPlaying = true;
    },
    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    playTrack: (state) => {
      state.isPlaying = true;
    },
    pauseTrack: (state) => {
      state.isPlaying = false;
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
    setNextTrack: (state, action: PayloadAction<any>) => {
      state.currentTrack = action.payload;
      state.isPlaying = true;
    },
  },
});

export const {
  setCurrentTrack,
  togglePlayPause,
  playTrack,
  pauseTrack,
  setVolume,
  toggleShuffle,
  toggleRepeat,
  setCurrentTime,
  setDuration,
  setNextTrack,
} = playerSlice.actions;

export default playerSlice.reducer;