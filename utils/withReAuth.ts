import { apiClient } from '@/services/apiClient';

interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  headers?: Record<string, string>;
}

export const withReAuth = async (config: RequestConfig): Promise<any> => {
  try {
    return await apiClient(config);
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('[withReAuth] Получена 401 ошибка, пытаюсь обновить токен...');
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('Refresh token отсутствует');
        }
        
        const refreshResponse = await apiClient({
          url: '/user/token/refresh/',
          method: 'POST',
          data: { refresh: refreshToken }
        });
        
        const newAccessToken = refreshResponse.data.access;
        
        localStorage.setItem('token', newAccessToken);
        
        const retryConfig = {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${newAccessToken}`
          }
        };
        
        console.log('[withReAuth] Токен обновлен, повторяю запрос...');
        return await apiClient(retryConfig);
        
      } catch (refreshError) {
        console.error('[withReAuth] Ошибка обновления токена:', refreshError);
        
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
          window.location.href = '/signin';
        }
        
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }
    }
    
    throw error;
  }
};