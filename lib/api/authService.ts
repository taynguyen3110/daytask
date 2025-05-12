import api from "./axios";
import { AuthState, User } from "../types";

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
}

export const authService = {
  async login(data: LoginData): Promise<AuthState> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    const token = response.data.token;
    localStorage.setItem("auth", JSON.stringify(response.data));
    return { isAuthenticated: true, token, user: response.data.user };
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
      return { isAuthenticated: false, token: null, user: null };
    }
    try {
      const authState = JSON.parse(auth);
      return { isAuthenticated: true, token: authState.token, user: authState.user };
    } catch (error) {
      localStorage.removeItem("auth");
      return { isAuthenticated: false, token: null, user: null };
    }
  },
};

export default authService;
