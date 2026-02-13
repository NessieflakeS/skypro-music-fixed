import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://webdev-music-003b5b991590.herokuapp.com";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
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
      const tokenResponse = await api.post<TokenResponse>("/user/token/", {
        email: credentials.email,
        password: credentials.password,
      });

      const userResponse = await api.post("/user/login/", {
        email: credentials.email,
        password: credentials.password,
      });

      return {
        access: tokenResponse.data.access,
        refresh: tokenResponse.data.refresh,
        user: {
          id: userResponse.data._id,
          email: userResponse.data.email,
          username: userResponse.data.username,
        },
      };
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          throw new Error("Пользователь с таким email или паролем не найден");
        } else if (status === 400) {
          const message =
            error.response.data?.message ||
            error.response.data?.email?.[0] ||
            error.response.data?.password?.[0] ||
            "Неверный формат данных";
          throw new Error(message);
        }
      }
      throw new Error("Ошибка входа. Проверьте подключение к интернету.");
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const registerResponse = await api.post("/user/signup/", {
        email: credentials.email,
        password: credentials.password,
        username: credentials.username,
      });

      if (registerResponse.status === 201 && registerResponse.data.success) {
        const tokenResponse = await api.post<TokenResponse>("/user/token/", {
          email: credentials.email,
          password: credentials.password,
        });

        return {
          access: tokenResponse.data.access,
          refresh: tokenResponse.data.refresh,
          user: {
            id: registerResponse.data.result._id,
            email: registerResponse.data.result.email,
            username: registerResponse.data.result.username,
          },
        };
      } else {
        throw new Error(registerResponse.data?.message || "Ошибка регистрации");
      }
    } catch (error: any) {
      console.error("Register error:", error);
      if (error.response) {
        const status = error.response.status;
        if (status === 403) {
          throw new Error(error.response.data?.message || "Email уже занят");
        } else if (status === 400) {
          const message =
            error.response.data?.message ||
            error.response.data?.email?.[0] ||
            error.response.data?.username?.[0] ||
            error.response.data?.password?.[0] ||
            "Неверный формат данных";
          throw new Error(message);
        }
      }
      throw new Error("Ошибка регистрации. Проверьте введенные данные.");
    }
  },
};