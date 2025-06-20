"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, Settings, UserTelegram } from "@/lib/types";
import { getLocalStorageItem } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface SettingsStore {
  settings: Settings;
  telegramUser: UserTelegram | null;
  updateSettings: (settings: Settings) => void;
  initializeTelegramUser: () => void;
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

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      telegramUser: null,
      updateSettings: (settings: Settings) => {
        set({ settings });
      },
      initializeTelegramUser: () => {
        const auth: AuthState | null = getLocalStorageItem<AuthState | null>(
          "auth",
          null
        );
        if (auth && auth.user && auth.chatId) {
          set({
            telegramUser: { id: auth.chatId },
          });
        } else {
          set({ telegramUser: null });
        }
      },
      linkTelegram: async (user: UserTelegram | null) => {
        try {
          const auth: AuthState | null = getLocalStorageItem<AuthState | null>(
            "auth",
            null
          );
          if (!auth || !auth.user) {
            toast({
              title: "Login required",
              description:
                "You must login before linking your Telegram account.",
              variant: "destructive",
            });
            return;
          }
          if (!user) {
            toast({
              title: "No Telegram user",
              description: "No Telegram user provided for linking.",
              variant: "destructive",
            });
            return;
          }
          const userId = auth.user.id;
          const result = await api.linkTelegramToUser(
            userId,
            user.id.toString()
          );
          if (result) {
            toast({
              title: "Telegram Linked",
              description: "You are now linked to your telegram account.",
              variant: "success",
            });
            set((state) => {
              api.initiate(user.id);
              return {
                settings: {
                  ...state.settings,
                  enableTelegramNotifications: true,
                },
                telegramUser: { id: user.id },
              };
            });
          }
        } catch (error) {
          toast({
            title: "Failed to link Telegram",
            description: "Failed to link Telegram user.",
            variant: "destructive",
          });
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
            toast({
              title: "Failed to link Telegram",
              description: "You must login to unlink your telegram account.",
              variant: "destructive",
            });
            console.error("You must login to unlink your telegram account.");
            return;
          }
          const userId = auth.user.id;
          const result = await api.unlinkTelegramFromUser(userId);
          if (result) {
            toast({
              title: "Telegram Unlinked",
              description: "You are now unlinked from your telegram account.",
              variant: "success",
            });
            set((state) => ({
              settings: {
                ...state.settings,
                enableTelegramNotifications: false,
              },
              telegramUser: null,
            }));
          }
        } catch (error) {
          toast({
            title: "Failed to link Telegram",
            description:
              "An error occurred while linking your Telegram account.",
            variant: "destructive",
          });
          console.error("Failed to unlink Telegram user:", error);
        }
      },
    }),
    {
      name: "settings-store", // localStorage key
    }
  )
);
