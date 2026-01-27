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
  success: boolean;
  message: string;
  data?: any;
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

export const testAPI = async () => {
  console.log('Testing API endpoints...');
  
  try {
    console.log('Testing registration...');
    const testRegister = await api.post('/user/signup/', {
      email: 'testapi@test.com',
      password: 'testpassword',
      username: 'TestAPIUser'
    });
    console.log('Registration test:', testRegister.data);
    
    console.log('Testing login...');
    const testLogin = await api.post('/user/login/', {
      email: 'testapi@test.com',
      password: 'testpassword'
    });
    console.log('Login test:', testLogin.data);
    
    return { register: testRegister.data, login: testLogin.data };
  } catch (error: any) {
    console.error('API test failed:', error.response?.data || error.message);
    return { error: error.response?.data || error.message };
  }
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('Attempting login with:', { email: credentials.email });
      
      console.log('Trying to get token first...');
      const tokenResponse = await api.post<TokenResponse>('/user/token/', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('Token response:', tokenResponse.data);
      
      console.log('Getting user data...');
      const loginResponse = await api.post<LoginResponse>('/user/login/', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('Login response:', loginResponse.data);
      
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
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        const status = error.response.status;
        
        if (status === 400) {
          const message = error.response.data?.message || 
                         error.response.data?.email?.[0] || 
                         error.response.data?.password?.[0] || 
                         'Неверный формат данных';
          throw new Error(message);
        } else if (status === 401) {
          throw new Error('Пользователь с таким email или паролем не найден');
        } else if (status === 412) {
          throw new Error('Данные в неверном формате. Проверьте введенные данные.');
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
      console.log('Registration data:', credentials);
      
      const registerData = {
        email: credentials.email,
        password: credentials.password,
        username: credentials.username,
        password1: credentials.password,
        password2: credentials.password,
      };
      
      console.log('Sending registration data:', registerData);
      
      const registerResponse = await api.post<RegisterResponse>('/user/signup/', registerData);
      console.log('Register response:', registerResponse.data);
      
      if (registerResponse.data.success === false) {
        throw new Error(registerResponse.data.message || 'Ошибка регистрации');
      }
      
      console.log('Getting token after registration...');
      const tokenResponse = await api.post<TokenResponse>('/user/token/', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('Token response after registration:', tokenResponse.data);
      
      console.log('Getting user data after registration...');
      const loginResponse = await api.post<LoginResponse>('/user/login/', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('User data after registration:', loginResponse.data);
      
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
      console.error('Register error:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
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
        } else if (status === 412) {
          const errorMsg = error.response.data?.message || 
                          error.response.data?.detail || 
                          'Данные в неверном формате';
          throw new Error(errorMsg);
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
      console.log('Logout: clearing local storage');
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