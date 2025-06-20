import api from "./axios";
import { ApiResponse, AuthState, User } from "../types";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface LoginResponse {
  user: User | null;
  token: { accessToken: string; refreshToken: string };
  isAuthenticated: boolean;
  message?: string;
  chatId: string | null;
}

export const authService = {
  async login(data: LoginData): Promise<AuthState> {
    const response = await api.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      data
    );
    const responseData = response.data.data as LoginResponse;
    localStorage.setItem("auth", JSON.stringify(responseData));
    return {
      isAuthenticated: true,
      token: responseData.token,
      user: responseData.user,
      chatId: responseData.chatId ?? null, // Assuming chatId is not part of the response
    };
  },

  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await api.post("/auth/register", data);
    return response.data as RegisterResponse;
  },

  async logout(): Promise<void> {
    localStorage.removeItem("auth");
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/auth/current-user");
    return response.data;
  },

  checkAuth(): AuthState {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      return { isAuthenticated: false, token: null, user: null, chatId: null};
    }
    try {
      const authState = JSON.parse(auth);
      return {
        isAuthenticated: true,
        token: authState.token,
        user: authState.user,
        chatId: authState.chatId ?? null
      };
    } catch (error) {
      localStorage.removeItem("auth");
      return { isAuthenticated: false, token: null, user: null, chatId: null };
    }
  },
};

export default authService;
