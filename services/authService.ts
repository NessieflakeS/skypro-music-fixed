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

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('Attempting login with:', { email: credentials.email });
      
      const tokenResponse = await api.post<{ access: string; refresh: string }>('/user/token/', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('Token response:', tokenResponse.data);
      
      const userResponse = await api.get(`/user/${tokenResponse.data.access}/`, {
        headers: {
          'Authorization': `Bearer ${tokenResponse.data.access}`
        }
      });
      
      const loginData = {
        email: credentials.email,
        password: credentials.password
      };
      
      const loginResponse = await api.post('/user/login/', loginData);
      console.log('Login response:', loginResponse.data);
      
      let userData;
      if (loginResponse.data && loginResponse.data._id) {
        userData = {
          id: loginResponse.data._id,
          email: loginResponse.data.email,
          username: loginResponse.data.username || loginResponse.data.email.split('@')[0],
        };
      } else {
        userData = {
          id: Date.now(),
          email: credentials.email,
          username: credentials.email.split('@')[0],
        };
      }
      
      return {
        access: tokenResponse.data.access,
        refresh: tokenResponse.data.refresh,
        user: userData
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.status === 401) {
          throw new Error('Неверный email или пароль');
        } else if (error.response.status === 400) {
          throw new Error('Неверный формат данных');
        }
      }
      
      throw new Error('Ошибка входа. Проверьте подключение к интернету.');
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      console.log('Attempting registration for:', credentials.username);
      
      const registerData = {
        email: credentials.email,
        password: credentials.password,
        username: credentials.username,
      };
      
      console.log('Sending registration data:', registerData);
      
      const registerResponse = await api.post('/user/signup/', registerData);
      console.log('Register response:', registerResponse.data);
      
      return await authService.login({
        email: credentials.email,
        password: credentials.password
      });
      
    } catch (error: any) {
      console.error('Register error:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.status === 403) {
          const errorMsg = error.response.data?.message || error.response.data?.email?.[0] || 'Email уже занят';
          throw new Error(errorMsg);
        } else if (error.response.status === 400) {
          const errorMsg = error.response.data?.message || 'Неверный формат данных';
          throw new Error(errorMsg);
        }
      }
      
      throw new Error('Ошибка регистрации. Проверьте введенные данные.');
    }
  },

  logout: async (): Promise<void> => {
    console.log('Logout: clearing auth data');
  },
};