import axios from 'axios';
import { Track } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const mockTracks: Track[] = [
  {
    _id: 1,
    name: 'Beautiful Things',
    author: 'Benson Boone',
    release_date: '2024-01-01',
    genre: ['Поп', 'Баллада'],
    duration_in_seconds: 205,
    album: 'Beautiful Things',
    logo: null,
    track_file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    stared_user: [],
  },
  {
    _id: 2,
    name: 'Adivino',
    author: 'Myke Towers, Bad Bunny',
    release_date: '2024-02-01',
    genre: ['Латино', 'Хип-хоп'],
    duration_in_seconds: 220,
    album: 'Adivino',
    logo: null,
    track_file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    stared_user: [],
  },
  {
    _id: 3,
    name: 'Britpop',
    author: 'A.G. Cook',
    release_date: '2024-03-01',
    genre: ['Электронная', 'Гиперпоп'],
    duration_in_seconds: 180,
    album: 'Britpop',
    logo: null,
    track_file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    stared_user: [],
  },
  {
    _id: 4,
    name: 'XO (Only if You Say Yes)',
    author: 'ENHYPEN',
    release_date: '2024-04-01',
    genre: ['K-pop'],
    duration_in_seconds: 195,
    album: 'XO',
    logo: null,
    track_file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    stared_user: [],
  },
  {
    _id: 5,
    name: 'After Hours',
    author: 'Kehlani',
    release_date: '2024-05-01',
    genre: ['R&B'],
    duration_in_seconds: 210,
    album: 'After Hours',
    logo: null,
    track_file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    stared_user: [],
  },
  {
    _id: 6,
    name: 'On the Game',
    author: 'The Black Keys',
    release_date: '2024-06-01',
    genre: ['Рок'],
    duration_in_seconds: 245,
    album: 'Ohio Players',
    logo: null,
    track_file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    stared_user: [],
  },
  {
    _id: 7,
    name: 'Big Dawgs',
    author: 'Hanumankind feat. Kalmi',
    release_date: '2024-07-01',
    genre: ['Хип-хоп'],
    duration_in_seconds: 230,
    album: 'Big Dawgs',
    logo: null,
    track_file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    stared_user: [],
  },
  {
    _id: 8,
    name: 'In Front of Me Now',
    author: 'Nada Surf',
    release_date: '2024-08-01',
    genre: ['Инди-рок'],
    duration_in_seconds: 215,
    album: 'Moon Mirror',
    logo: null,
    track_file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    stared_user: [],
  },
  {
    _id: 9,
    name: "That's My Floor",
    author: 'Magdalena Bay',
    release_date: '2024-09-01',
    genre: ['Синти-поп'],
    duration_in_seconds: 200,
    album: 'Imaginal Disk',
    logo: null,
    track_file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    stared_user: [],
  },
  {
    _id: 10,
    name: 'Von dutch',
    author: 'Charli XCX',
    release_date: '2024-10-01',
    genre: ['Поп'],
    duration_in_seconds: 190,
    album: 'Brat',
    logo: null,
    track_file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    stared_user: [],
  },
];

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const trackService = {
  getAllTracks: async (): Promise<Track[]> => {
    console.log('Using mock track data');
    await delay(500); 
    
    return mockTracks;
  },

  getSelectionTracks: async (selectionId: number): Promise<Track[]> => {
    console.log(`Using mock selection data for selection ${selectionId}`);
    await delay(500);
    
    switch(selectionId) {
      case 1: 
        return mockTracks.slice(0, 4);
      case 2: 
        return mockTracks.slice(2, 6);
      case 3: 
        return mockTracks.slice(4, 8);
      default:
        return mockTracks.slice(0, 4);
    }
  },

  likeTrack: async (trackId: number): Promise<void> => {
    console.log(`Mock: Track ${trackId} liked`);
    await delay(200);
  },

  dislikeTrack: async (trackId: number): Promise<void> => {
    console.log(`Mock: Track ${trackId} disliked`);
    await delay(200);
  },
};