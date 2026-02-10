import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  username: string;
  email: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  favoriteTracks: number[]; 
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  favoriteTracks: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.favoriteTracks = []; 
    },
    clearError: (state) => {
      state.error = null;
    },
    setFavoriteTracks: (state, action: PayloadAction<number[]>) => {
      state.favoriteTracks = action.payload;
    },
    addFavoriteTrack: (state, action: PayloadAction<number>) => {
      if (!state.favoriteTracks.includes(action.payload)) {
        state.favoriteTracks.push(action.payload);
      }
    },
    removeFavoriteTrack: (state, action: PayloadAction<number>) => {
      state.favoriteTracks = state.favoriteTracks.filter(id => id !== action.payload);
    },
    toggleFavoriteTrack: (state, action: PayloadAction<number>) => {
      const trackId = action.payload;
      const index = state.favoriteTracks.indexOf(trackId);
      if (index >= 0) {
        state.favoriteTracks.splice(index, 1);
      } else {
        state.favoriteTracks.push(trackId);
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  clearError,
  setFavoriteTracks,
  addFavoriteTrack,
  removeFavoriteTrack,
  toggleFavoriteTrack,
} = userSlice.actions;

export default userSlice.reducer;