import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TrackForPlayer {
  id: number;
  name: string;
  author: string;
  album: string;
  time: string;
  track_file?: string;
}

interface PlayerState {
  currentTrack: TrackForPlayer | null;
  isPlaying: boolean;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
  currentTime: number;
  duration: number;
  shuffledOrder: number[];
  currentShuffleIndex: number;
  currentPlaylist: TrackForPlayer[];
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  volume: 0.5,
  shuffle: false,
  repeat: false,
  currentTime: 0,
  duration: 0,
  shuffledOrder: [],
  currentShuffleIndex: -1,
  currentPlaylist: [],
};

const generateShuffledOrderHelper = (state: PlayerState) => {
  const trackIds = state.currentPlaylist.map(track => track.id);
  const shuffled = [...trackIds];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  if (state.currentTrack) {
    const currentIndex = shuffled.indexOf(state.currentTrack.id);
    if (currentIndex === 0 && shuffled.length > 1) {
      const swapIndex = Math.floor(Math.random() * (shuffled.length - 1)) + 1;
      [shuffled[0], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[0]];
    }
  }
  
  return shuffled;
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<{track: TrackForPlayer, playlist: TrackForPlayer[]}>) => {
      state.currentTrack = action.payload.track;
      state.currentPlaylist = action.payload.playlist;
      state.isPlaying = true;
      
      const trackIndex = action.payload.playlist.findIndex(t => t.id === action.payload.track.id);
      state.currentShuffleIndex = trackIndex;
      
      if (state.shuffle) {
        state.shuffledOrder = generateShuffledOrderHelper(state);
      }
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
      
      if (state.shuffle && state.currentPlaylist.length > 0) {
        state.shuffledOrder = generateShuffledOrderHelper(state);
      } else {
        state.shuffledOrder = [];
      }
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
      if (!state.currentTrack || state.currentPlaylist.length === 0) return;
      
      let nextTrack: TrackForPlayer | null = null;
      let nextIndex = -1;
      
      if (state.shuffle && state.shuffledOrder.length > 0) {
        const currentId = state.currentTrack.id;
        const currentShuffleIndex = state.shuffledOrder.indexOf(currentId);
        
        if (currentShuffleIndex !== -1) {
          const nextShuffleIndex = (currentShuffleIndex + 1) % state.shuffledOrder.length;
          const nextTrackId = state.shuffledOrder[nextShuffleIndex];
          const foundTrack = state.currentPlaylist.find(t => t.id === nextTrackId);
          
          if (foundTrack) {
            nextTrack = foundTrack;
            nextIndex = state.currentPlaylist.findIndex(t => t.id === nextTrackId);
          }
        }
      } else {
        const currentIndex = state.currentPlaylist.findIndex(t => t.id === state.currentTrack.id);
        if (currentIndex !== -1) {
          nextIndex = (currentIndex + 1) % state.currentPlaylist.length;
          nextTrack = state.currentPlaylist[nextIndex];
        }
      }
      
      if (nextTrack) {
        state.currentTrack = nextTrack;
        state.currentShuffleIndex = nextIndex;
        state.currentTime = 0;
        state.isPlaying = true;
      }
    },
    
    setPrevTrack: (state) => {
      if (!state.currentTrack || state.currentPlaylist.length === 0) return;
      
      let prevTrack: TrackForPlayer | null = null;
      let prevIndex = -1;
      
      if (state.shuffle && state.shuffledOrder.length > 0) {
        const currentId = state.currentTrack.id;
        const currentShuffleIndex = state.shuffledOrder.indexOf(currentId);
        
        if (currentShuffleIndex !== -1) {
          const prevShuffleIndex = (currentShuffleIndex - 1 + state.shuffledOrder.length) % state.shuffledOrder.length;
          const prevTrackId = state.shuffledOrder[prevShuffleIndex];
          const foundTrack = state.currentPlaylist.find(t => t.id === prevTrackId);
          
          if (foundTrack) {
            prevTrack = foundTrack;
            prevIndex = state.currentPlaylist.findIndex(t => t.id === prevTrackId);
          }
        }
      } else {
        const currentIndex = state.currentPlaylist.findIndex(t => t.id === state.currentTrack.id);
        if (currentIndex !== -1) {
          prevIndex = (currentIndex - 1 + state.currentPlaylist.length) % state.currentPlaylist.length;
          prevTrack = state.currentPlaylist[prevIndex];
        }
      }
      
      if (prevTrack) {
        state.currentTrack = prevTrack;
        state.currentShuffleIndex = prevIndex;
        state.currentTime = 0;
        state.isPlaying = true;
      }
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
  setPrevTrack,
} = playerSlice.actions;

export default playerSlice.reducer;