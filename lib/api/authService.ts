import api from './axios';
import { AuthState, User } from '../types';

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

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(data: LoginData): Promise<AuthState> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    const  token = response.data.accessToken;
    localStorage.setItem('token', token);
    return { isAuthenticated: true, token };
  },

  async register(data: RegisterData): Promise<void> {
    await api.post('/auth/register', data);
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/current-user');
    return response.data;
  },

  checkAuth(): AuthState {
    const token = localStorage.getItem('token');
    if (!token) {
      return { isAuthenticated: false, token: null };
    }
    try {
      return { isAuthenticated: true, token };
    } catch (error) {
      localStorage.removeItem('token');
      return { isAuthenticated: false, token: null };
    }
  },
};

export default authService;