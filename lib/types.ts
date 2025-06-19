export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean | null;
  dueDate?: string;
  priority?: string;
  labels?: string[] | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  recurrence: string | null;
  reminder: string | null;
  snoozedUntil: string | null;
  userId: string | null;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
  errors?: string[];
}

export interface SyncTask {
  action: "add" | "update" | "delete";
  task: Task | string;
  timestamp: number;
}

export interface SyncNote {
  action: "add" | "update" | "delete";
  note: Note | string;
  timestamp: number;
}

export type UserMode = "online-user" | "offline-user" | "guest";

export interface UserTelegram {
  id: string;
  auth_date: number;
  first_name: string;
  last_name: string;
  username: boolean;
  hash: string;
}
