import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://webdev-music-003b5b991590.herokuapp.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export interface TokenResponse {
  access: string;
  refresh: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('Attempting login with:', { email: credentials.email });
      
      const tokenResponse = await api.post<TokenResponse>('/user/token/', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('Token response:', tokenResponse.data);
      
      const userResponse = await api.post('/user/login/', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('User response:', userResponse.data);
      
      return {
        access: tokenResponse.data.access,
        refresh: tokenResponse.data.refresh,
        user: {
          id: userResponse.data._id,
          email: userResponse.data.email,
          username: userResponse.data.username,
        }
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 401) {
          throw new Error('Пользователь с таким email или паролем не найден');
        } else if (status === 400) {
          const message = error.response.data?.message || 
                         error.response.data?.email?.[0] || 
                         error.response.data?.password?.[0] || 
                         'Неверный формат данных';
          throw new Error(message);
        }
      }
      
      throw new Error('Ошибка входа. Проверьте подключение к интернету.');
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      console.log('Attempting registration with:', {
        email: credentials.email,
        username: credentials.username
      });
      
      const registerData = {
        email: credentials.email,
        password: credentials.password,
        username: credentials.username
      };
      
      console.log('Sending registration data:', registerData);
      
      const registerResponse = await api.post('/user/signup/', registerData);
      console.log('Register response:', registerResponse.data);
      
      if (registerResponse.status === 201 && registerResponse.data.success) {
        console.log('Registration successful, attempting auto-login...');
        
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
      } else {
        throw new Error(registerResponse.data?.message || 'Ошибка регистрации');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 403) {
          throw new Error(error.response.data?.message || 'Email уже занят');
        } else if (status === 400) {
          const message = error.response.data?.message || 
                         error.response.data?.email?.[0] || 
                         error.response.data?.username?.[0] || 
                         error.response.data?.password?.[0] || 
                         'Неверный формат данных';
          throw new Error(message);
        }
      }
      
      throw new Error('Ошибка регистрации. Проверьте введенные данные.');
    }
  },

  logout: async (): Promise<void> => {
    try {
      console.log('Logging out...');
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

export const setAuthTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  
  const maxAge = 7 * 24 * 60 * 60; 
  document.cookie = `token=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
  
  console.log('[setAuthTokens] Токены сохранены в localStorage и cookies');
};