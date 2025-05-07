"use client"

import { create } from "zustand"
import type { Notification } from "@/lib/types"
import { generateId, getLocalStorageItem, setLocalStorageItem } from "@/lib/utils"

interface NotificationStore {
  notifications: Notification[]
  addNotification: (notification: Partial<Notification>) => void
  markAsRead: (id: string) => void
  clearNotifications: () => void
}

export const useNotifications = create<NotificationStore>((set) => ({
  notifications: typeof window !== "undefined" ? getLocalStorageItem<Notification[]>("notifications", []) : [],

  addNotification: (notification: Partial<Notification>) => {
    const newNotification: Notification = {
      id: generateId(),
      title: notification.title || "Notification",
      message: notification.message || "",
      read: false,
      createdAt: new Date().toISOString(),
      taskId: notification.taskId,
    }

    set((state) => {
      const updatedNotifications = [...state.notifications, newNotification]
      setLocalStorageItem("notifications", updatedNotifications)
      return { notifications: updatedNotifications }
    })

    // If browser notifications are enabled, show a browser notification
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(newNotification.title, {
          body: newNotification.message,
        })
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(newNotification.title, {
              body: newNotification.message,
            })
          }
        })
      }
    }
  },

  markAsRead: (id: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      )
      setLocalStorageItem("notifications", updatedNotifications)
      return { notifications: updatedNotifications }
    })
  },

  clearNotifications: () => {
    set(() => {
      setLocalStorageItem("notifications", [])
      return { notifications: [] }
    })
  },
}))
