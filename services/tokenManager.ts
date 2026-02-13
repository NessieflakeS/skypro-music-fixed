const TOKEN_KEY = 'token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'user';

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
};

export const setTokens = (access: string, refresh: string): void => {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  document.cookie = `${TOKEN_KEY}=${access}; path=/; max-age=604800; SameSite=Lax`;
  document.cookie = `${REFRESH_KEY}=${refresh}; path=/; max-age=604800; SameSite=Lax`;
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${REFRESH_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export const getUser = (): any | null => {
  const userStr = localStorage.getItem(USER_KEY);
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const setUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthCookies = clearTokens;
export const syncTokens = () => {
};
export const setAccessToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=604800; SameSite=Lax`;
};