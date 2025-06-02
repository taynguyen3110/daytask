"use client";

import { create } from "zustand";
import type { AuthState, Settings, UserTelegram } from "@/lib/types";
import { getLocalStorageItem, setLocalStorageItem } from "@/lib/utils";
import api from "@/lib/api";

interface SettingsStore {
  settings: Settings;
  telegramUser: UserTelegram | null;
  updateSettings: (settings: Settings) => void;
  linkTelegram: (user: UserTelegram | null) => void;
  unlinkTelegram: () => void;
}

const defaultSettings: Settings = {
  theme: "system",
  enableOfflineMode: true,
  enableBrowserNotifications: false,
  enableTelegramNotifications: false,
  autoSuggestDueDates: true,
  showConfetti: true,
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings:
    typeof window !== "undefined"
      ? getLocalStorageItem<Settings>("settings", defaultSettings)
      : defaultSettings,
  telegramUser: null,
  updateSettings: (settings: Settings) => {
    set({ settings });
    setLocalStorageItem("settings", settings);
  },
  linkTelegram: async (user: UserTelegram | null) => {
    try {
      const auth: AuthState | null = getLocalStorageItem<AuthState | null>(
        "auth",
        null
      );
      if (!auth || !auth.user) {
        console.error("You must login before link to your telegram account.");
        return;
      }
      if (!user) {
        console.error("No telegram user provided for linking Telegram.");
        return;
      }
      const userId = auth.user.id;
      await api.linkTelegramToUser(userId, user.id);
      set((state) => {
        api.initiate(state.telegramUser!.id);
        return {
          settings: { ...state.settings, enableTelegramNotifications: true },
          telegramUser: user,
        };
      });
    } catch (error) {
      console.error("Failed to link Telegram user:", error);
    }
  },
  unlinkTelegram: async () => {
    try {
      const auth: AuthState | null = getLocalStorageItem<AuthState | null>(
        "auth",
        null
      );
      if (!auth || !auth.user) {
        console.error("You must login to unlink your telegram account.");
        return;
      }
      const userId = auth.user.id;
      await api.unlinkTelegramFromUser(userId);
      set((state) => ({
        settings: { ...state.settings, enableTelegramNotifications: false },
        telegramUser: null,
      }));
    } catch (error) {
      console.error("Failed to unlink Telegram user:", error);
    }
  },
}));
