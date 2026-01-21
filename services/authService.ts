import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || true;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

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

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (USE_MOCK) {
      console.log('Mock auth: Login for', credentials.email);
      await delay(500);
      
      return {
        access_token: 'mock-jwt-token-12345',
        user: {
          id: 1,
          email: credentials.email,
          username: credentials.email.split('@')[0] || 'user'
        }
      };
    }

    try {
      const response = await api.post<AuthResponse>('/user/login/', credentials);
      return response.data;
    } catch (error: any) {
      console.error('Login error, using mock response:', error);
      await delay(500);
      return {
        access_token: 'mock-jwt-token-12345',
        user: {
          id: 1,
          email: credentials.email,
          username: credentials.email.split('@')[0] || 'user'
        }
      };
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    if (USE_MOCK) {
      console.log('Mock auth: Register for', credentials.username);
      await delay(500);
      
      return {
        access_token: 'mock-jwt-token-12345',
        user: {
          id: 2,
          email: credentials.email,
          username: credentials.username
        }
      };
    }

    try {
      const response = await api.post<AuthResponse>('/user/signup/', credentials);
      return response.data;
    } catch (error: any) {
      console.error('Register error, using mock response:', error);
      await delay(500);
      return {
        access_token: 'mock-jwt-token-12345',
        user: {
          id: 2,
          email: credentials.email,
          username: credentials.username
        }
      };
    }
  },

  logout: async (): Promise<void> => {
    if (USE_MOCK) {
      console.log('Mock auth: Logout');
      await delay(200);
      return;
    }

    try {
      await api.post('/user/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },
};