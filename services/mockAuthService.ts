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

const MOCK_USERS_KEY = 'mock_users';
const MOCK_CURRENT_USER_KEY = 'mock_current_user';

const initMockStorage = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(MOCK_USERS_KEY)) {
    const mockUsers = [
      {
        id: 1,
        email: 'test@test.com',
        password: 'test123',
        username: 'Тестовый пользователь',
      }
    ];
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(mockUsers));
  }
};

export const mockAuthService = {
  init: () => {
    initMockStorage();
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const usersStr = localStorage.getItem(MOCK_USERS_KEY);
          const users = usersStr ? JSON.parse(usersStr) : [];
          
          const user = users.find(
            (u: any) => u.email === credentials.email && u.password === credentials.password
          );
          
          if (user) {
            const response: AuthResponse = {
              access: 'mock-jwt-token-' + Date.now(),
              refresh: 'mock-refresh-token-' + Date.now(),
              user: {
                id: user.id,
                email: user.email,
                username: user.username,
              }
            };
            
            localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(response.user));
            
            resolve(response);
          } else {
            reject(new Error('Неверный email или пароль'));
          }
        } catch (error) {
          reject(new Error('Ошибка при входе'));
        }
      }, 500);
    });
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const usersStr = localStorage.getItem(MOCK_USERS_KEY);
          const users = usersStr ? JSON.parse(usersStr) : [];
          
          const existingUser = users.find(
            (u: any) => u.email === credentials.email
          );
          
          if (existingUser) {
            reject(new Error('Пользователь с таким email уже существует'));
            return;
          }
          
          const newUser = {
            id: Date.now(),
            email: credentials.email,
            password: credentials.password,
            username: credentials.username,
          };
          
          users.push(newUser);
          localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
          
          const response: AuthResponse = {
            access: 'mock-jwt-token-' + Date.now(),
            refresh: 'mock-refresh-token-' + Date.now(),
            user: {
              id: newUser.id,
              email: newUser.email,
              username: newUser.username,
            }
          };
          
          localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(response.user));
          
          resolve(response);
        } catch (error) {
          reject(new Error('Ошибка при регистрации'));
        }
      }, 500);
    });
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(MOCK_CURRENT_USER_KEY);
  },

  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem(MOCK_CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!mockAuthService.getCurrentUser();
  }
};