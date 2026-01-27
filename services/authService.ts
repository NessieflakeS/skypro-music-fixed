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
  access: string;
  refresh: string;
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
      console.log('Login attempt with:', credentials);
      
      const response = await api.post<AuthResponse>('/api/user/login/', credentials);
      
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login error details:', error.response?.data || error.message);
      
      let errorMessage = 'Ошибка входа';
      
      if (error.response?.status === 412) {
        errorMessage = 'Неверные учетные данные или требуется подтверждение email';
      } else if (error.response?.status === 400) {
        const data = error.response.data;
        if (data.email) errorMessage = `Email: ${data.email[0]}`;
        else if (data.password) errorMessage = `Пароль: ${data.password[0]}`;
        else if (data.detail) errorMessage = data.detail;
      } else if (error.response?.status === 401) {
        errorMessage = 'Неверный email или пароль';
      }
      
      throw new Error(errorMessage);
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      console.log('Register attempt with:', credentials);
      
      const response = await api.post<AuthResponse>('/api/user/signup/', credentials);
      
      console.log('Register successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Register error details:', error.response?.data || error.message);
      
      let errorMessage = 'Ошибка регистрации';
      
      if (error.response?.status === 400) {
        const data = error.response.data;
        if (data.email) errorMessage = `Email: ${data.email[0]}`;
        else if (data.username) errorMessage = `Имя пользователя: ${data.username[0]}`;
        else if (data.password) errorMessage = `Пароль: ${data.password[0]}`;
        else if (data.detail) errorMessage = data.detail;
        else errorMessage = 'Проверьте введенные данные';
      }
      
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