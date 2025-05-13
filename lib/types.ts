export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority?: string;
  labels?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  recurrence?: string;
  reminder?: string;
  snoozedUntil?: string;
  userId?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  taskId?: string;
}

export interface Settings {
  theme: string;
  enableOfflineMode: boolean;
  enableBrowserNotifications: boolean;
  enableTelegramNotifications: boolean;
  telegramToken?: string;
  telegramChatId?: string;
  autoSuggestDueDates: boolean;
  showConfetti: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: { accessToken: string; refreshToken: string } | null;
  user: User | null;
}
