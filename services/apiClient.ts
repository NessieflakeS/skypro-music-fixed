import axios from 'axios';
import { withReAuth } from '@/utils/withReAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://webdev-music-003b5b991590.herokuapp.com';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (originalRequest.url.includes('/user/token/refresh/')) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('Refresh token отсутствует');
        }
        
        const refreshResponse = await axios.post(`${API_URL}/user/token/refresh/`, {
          refresh: refreshToken
        });
        
        const newAccessToken = refreshResponse.data.access;
        localStorage.setItem('token', newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        console.error('Не удалось обновить токен:', refreshError);
        
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const authApi = {
  get: (url: string, config?: any) => withReAuth({ url, method: 'GET', ...config }),
  post: (url: string, data?: any, config?: any) => withReAuth({ url, method: 'POST', data, ...config }),
  put: (url: string, data?: any, config?: any) => withReAuth({ url, method: 'PUT', data, ...config }),
  delete: (url: string, config?: any) => withReAuth({ url, method: 'DELETE', ...config }),
  patch: (url: string, data?: any, config?: any) => withReAuth({ url, method: 'PATCH', data, ...config }),
};