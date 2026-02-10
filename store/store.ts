import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import playerReducer from './playerSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    player: playerReducer,
  },
});

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      player: playerReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;