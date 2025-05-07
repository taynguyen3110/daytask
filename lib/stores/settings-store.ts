"use client"

import { create } from "zustand"
import type { Settings } from "@/lib/types"
import { getLocalStorageItem, setLocalStorageItem } from "@/lib/utils"

interface SettingsStore {
  settings: Settings
  updateSettings: (settings: Settings) => void
}

const defaultSettings: Settings = {
  theme: "system",
  enableOfflineMode: true,
  enableBrowserNotifications: false,
  enableTelegramNotifications: false,
  autoSuggestDueDates: true,
  showConfetti: true,
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings:
    typeof window !== "undefined" ? getLocalStorageItem<Settings>("settings", defaultSettings) : defaultSettings,

  updateSettings: (settings: Settings) => {
    set({ settings })
    setLocalStorageItem("settings", settings)
  },
}))
