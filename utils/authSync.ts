export const syncAuthToCookies = (): void => {
  if (typeof window === 'undefined') return;
  
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (token) {
    document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
  }
  
  if (refreshToken) {
    document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
  }
  
  console.log('[authSync] Токены синхронизированы с cookies');
};

export const clearAuthCookies = (): void => {
  if (typeof window === 'undefined') return;
  
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  console.log('[authSync] Cookies очищены');
};

export const getTokenFromCookies = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') {
      return decodeURIComponent(value);
    }
  }
  return null;
};