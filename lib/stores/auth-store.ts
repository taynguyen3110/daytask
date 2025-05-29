import { create } from "zustand";
import { AuthState } from "../types";
import authService, { RegisterResponse } from "../api/authService";

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  message: string;
  syncData: boolean;
  setSyncData: (syncData: boolean) => void;
  mergeData: boolean;
  setMergeData: (syncData: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  message: "",
  syncData: false,
  setSyncData: (isSync: boolean) => set({ syncData: isSync }),
  mergeData: false,
  setMergeData: (isMerge: boolean) => set({ mergeData: isMerge }),

  login: async (email, password) => {
    const authState = await authService.login({ email, password });
    set(authState);
  },

  register: async (username, email, password, confirmPassword) => {
    const response = await authService.register({
      username,
      email,
      password,
      confirmPassword,
    });
    if (response.success) {
      set({ message: response.message });
    }
  },

  logout: () => {
    authService.logout();
    set({ isAuthenticated: false, token: null, user: null });
  },

  initialize: async () => {
    const { isAuthenticated, token, user } = authService.checkAuth();
    if (isAuthenticated && token && user) {
      try {
        set({ isAuthenticated: true, token, user });
      } catch (error) {
        authService.logout();
        set({ isAuthenticated: false, token: null, user: null });
      }
    }
  },
}));
