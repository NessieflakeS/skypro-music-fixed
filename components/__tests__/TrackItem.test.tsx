import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import * as redux from 'react-redux';

import userReducer from '@/store/slices/userSlice';
import playerReducer from '@/store/slices/playerSlice';
import TrackItem from '@/components/track/TrackItem/TrackItem';
import { ITrackDisplay } from '@/types/index';

jest.mock('@/services/trackService', () => ({
  trackService: {
    toggleLike: jest.fn(),
  },
}));

const mockStore = configureStore({
  reducer: {
    user: userReducer,
    player: playerReducer,
  },
  preloadedState: {
    user: {
      user: null,
      isAuthenticated: true,
      loading: false,
      error: null,
      favoriteTracks: [],
      theme: 'dark' as const,
    },
  },
});

const mockTrack: ITrackDisplay = {
  id: 1,
  name: 'Test Track',
  author: 'Test Author',
  album: 'Test Album',
  time: '3:30',
  track_file: 'test.mp3',
  link: '#',
  authorLink: '#',
  albumLink: '#',
  genre: ['Rock'],
  release_date: '2023-01-01',
};

const mockPlaylist = [mockTrack];

describe('TrackItem', () => {
  let useDispatchSpy: jest.SpyInstance;
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    useDispatchSpy = jest.spyOn(redux, 'useDispatch').mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    useDispatchSpy.mockRestore();
    jest.clearAllMocks();
  });

  test('отображает информацию о треке', () => {
    render(
      <Provider store={mockStore}>
        <TrackItem track={mockTrack} playlist={mockPlaylist} />
      </Provider>
    );

    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('Test Album')).toBeInTheDocument();
    expect(screen.getByText('3:30')).toBeInTheDocument();
  });

  test('при клике на трек вызывается экшен плеера', () => {
    render(
      <Provider store={mockStore}>
        <TrackItem track={mockTrack} playlist={mockPlaylist} />
      </Provider>
    );

    const trackElement = screen.getByText('Test Track').closest('div')?.parentElement?.parentElement;
    fireEvent.click(trackElement!);

    expect(mockDispatch).toHaveBeenCalled();
  });
});