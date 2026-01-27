import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://webdev-music-003b5b991590.herokuapp.com';

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

export interface LoginResponse {
  email: string;
  username: string;
  _id: number;
}

export interface RegisterResponse {
  message: string;
  result: {
    username: string;
    email: string;
    _id: number;
  };
  success: boolean;
}

export interface TokenResponse {
  access: string;
  refresh: string;
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
      console.log('Attempting login with:', { email: credentials.email });
      
      const loginResponse = await api.post<LoginResponse>('/user/login/', credentials);
      console.log('Login response:', loginResponse.data);
      
      const tokenResponse = await api.post<TokenResponse>('/user/token/', credentials);
      console.log('Token response received');
      
      return {
        access: tokenResponse.data.access,
        refresh: tokenResponse.data.refresh,
        user: {
          id: loginResponse.data._id,
          email: loginResponse.data.email,
          username: loginResponse.data.username,
        }
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        const status = error.response.status;
        
        if (status === 400) {
          const message = error.response.data?.message || 
                         error.response.data?.email?.[0] || 
                         error.response.data?.password?.[0] || 
                         'Неверный формат данных';
          throw new Error(message);
        } else if (status === 401) {
          throw new Error('Пользователь с таким email или паролем не найден');
        } else if (status === 500) {
          throw new Error('Сервер временно недоступен');
        }
      }
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Нет соединения с сервером');
      }
      
      throw new Error(error.message || 'Ошибка входа');
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      console.log('Attempting registration for:', credentials.username);
      
      const registerData = {
        email: credentials.email,
        password1: credentials.password,
        password2: credentials.password,
        username: credentials.username,
      };
      
      const registerResponse = await api.post<RegisterResponse>('/user/signup/', registerData);
      console.log('Register response:', registerResponse.data);
      
      if (!registerResponse.data.success) {
        throw new Error(registerResponse.data.message || 'Ошибка регистрации');
      }
      
      const tokenResponse = await api.post<TokenResponse>('/user/token/', {
        email: credentials.email,
        password: credentials.password
      });
      
      return {
        access: tokenResponse.data.access,
        refresh: tokenResponse.data.refresh,
        user: {
          id: registerResponse.data.result._id,
          email: registerResponse.data.result.email,
          username: registerResponse.data.result.username,
        }
      };
    } catch (error: any) {
      console.error('Register error:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        const status = error.response.status;
        
        if (status === 400) {
          const message = error.response.data?.message || 
                         error.response.data?.email?.[0] || 
                         error.response.data?.username?.[0] || 
                         error.response.data?.password?.[0] || 
                         'Неверный формат данных';
          throw new Error(message);
        } else if (status === 403) {
          throw new Error(error.response.data?.message || 'Email уже занят');
        } else if (status === 500) {
          throw new Error('Сервер временно недоступен');
        }
      }
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Нет соединения с сервером');
      }
      
      throw new Error(error.message || 'Ошибка регистрации');
    }
  },

  logout: async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/user/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  refreshToken: async (refreshToken: string): Promise<string> => {
    try {
      const response = await api.post<TokenResponse>('/user/token/refresh/', {
        refresh: refreshToken
      });
      return response.data.access;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Не удалось обновить токен');
    }
  },
};