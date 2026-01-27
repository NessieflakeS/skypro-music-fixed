import axios from 'axios';

const API_URL = 'https://webdev-music-003b5b991590.herokuapp.com';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  access_token?: string;
  access?: string;
  refresh_token?: string;
  refresh?: string;
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
});

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/api/user/login/', credentials);
      const data = response.data;
      
      const token = data.access || data.access_token;
      const refreshToken = data.refresh || data.refresh_token;
      
      if (!token || !refreshToken) {
        throw new Error('Сервер не вернул токены авторизации');
      }
      
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.email?.[0] || 
                          error.response?.data?.password?.[0] || 
                          error.message || 
                          'Ошибка входа';
      
      throw new Error(errorMessage);
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/api/user/signup/', credentials);
      const data = response.data;
      
      const token = data.access || data.access_token;
      const refreshToken = data.refresh || data.refresh_token;
      
      if (!token || !refreshToken) {
        throw new Error('Сервер не вернул токены авторизации');
      }
      
      return data;
    } catch (error: any) {
      console.error('Register error:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.email?.[0] || 
                          error.response?.data?.username?.[0] || 
                          error.response?.data?.password?.[0] || 
                          error.message || 
                          'Ошибка регистрации';
      
      throw new Error(errorMessage);
    }
  },

  logout: async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/api/user/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
};