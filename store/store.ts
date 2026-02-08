import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import playerReducer from './playerSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      player: playerReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];