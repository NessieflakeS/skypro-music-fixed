import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
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
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
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
  },

  logout: async (): Promise<void> => {
    console.log('Mock auth: Logout');
    await delay(200);
  },
};