import '@testing-library/jest-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

const mockUseDispatch = jest.fn();
const mockUseSelector = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockUseDispatch,
  useSelector: (selector: any) => mockUseSelector(selector),
}));

import userReducer from "@/store/slices/userSlice";
import playerReducer from "@/store/slices/playerSlice";
import TrackItem from "@/components/track/TrackItem/TrackItem";
import { ITrackDisplay } from "@/types/index";

describe("TrackItem", () => {
  beforeEach(() => {
    mockUseDispatch.mockClear();
    mockUseSelector.mockClear();

    mockUseSelector.mockImplementation((selector: any) =>
      selector({
        user: { favoriteTracks: [] },
        player: { currentTrack: null, isPlaying: false },
      })
    );
  });

  const mockTrack: ITrackDisplay = {
    id: 1,
    name: "Test Track",
    author: "Test Author",
    album: "Test Album",
    time: "3:30",
    track_file: "test.mp3",
    link: "#",
    authorLink: "#",
    albumLink: "#",
    genre: ["Rock"],
    release_date: "2023-01-01",
  };

  const mockPlaylist = [mockTrack];

  const store = configureStore({
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
        theme: "dark" as const,
      },
    },
  });

  test("отображает информацию о треке", () => {
    render(
      <Provider store={store}>
        <TrackItem track={mockTrack} playlist={mockPlaylist} />
      </Provider>
    );

    expect(screen.getByText("Test Track")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
    expect(screen.getByText("Test Album")).toBeInTheDocument();
    expect(screen.getByText("3:30")).toBeInTheDocument();
  });

  test("при клике на трек вызывается экшен плеера", () => {
    render(
      <Provider store={store}>
        <TrackItem track={mockTrack} playlist={mockPlaylist} />
      </Provider>
    );

    const titleElement = screen.getByText("Test Track");
    const trackItem = titleElement.closest('div[class*="playlist__item"]');
    expect(trackItem).toBeInTheDocument();

    fireEvent.click(trackItem!);

    expect(mockUseDispatch).toHaveBeenCalled();
  });
});