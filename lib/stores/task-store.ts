"use client";

import { create } from "zustand";
import type { AuthState, SyncTask, Task, UserMode } from "@/lib/types";
import { useNotifications } from "@/lib/hooks/use-notifications";
import api from "@/lib/api";
import { taskDB } from "../db";
import { generateId, getLocalStorageItem } from "../utils";
import { persist } from "zustand/middleware";

interface TaskStore {
  tasks: Task[];
  pendingSync: SyncTask[];
  fetchTasks: () => Promise<void>;
  createTask: (task: Partial<Task>, userMode: UserMode) => Promise<Task>;
  updateTask: (task: Task, userMode: UserMode) => Promise<Task>;
  deleteTask: (id: string, userMode: UserMode) => Promise<void>;
  syncTasks: () => Promise<void>;
  mergeTasks: () => Promise<void>;
  removeLocalTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      pendingSync: [],

      fetchTasks: async () => {
        try {
          // Fetch tasks from indexedDB
          let tasks = await api.fetchLocalTasks();
          tasks = tasks.map((task) => {
            return {
              ...task,
            };
          });
          set({ tasks });
        } catch (error) {}
      },

      createTask: async (task: Partial<Task>, userMode: UserMode) => {
        const auth = getLocalStorageItem<AuthState>("auth", {} as AuthState);
        const currentUser = auth.user;
        const newTask: Task = {
          id: generateId(),
          title: task.title || "",
          description: task.description || "",
          completed: false,
          dueDate: task.dueDate,
          priority: task.priority || "medium",
          labels: task.labels,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: null,
          recurrence: task.recurrence ?? null,
          reminder: task.reminder ?? null,
          snoozedUntil: task.snoozedUntil ?? null,
          userId: currentUser?.id || null,
        };
        try {
          if (userMode === "online-user") {
            // Create the task on the server
            await api.createTask(newTask);
          } else if (userMode === "offline-user") {
            const syncAction: SyncTask = {
              action: "add",
              task: { ...newTask } as Task,
              timestamp: Date.now(),
            };
            set((state) => ({
              pendingSync: [...state.pendingSync, syncAction],
            }));
          }
          // Add the task to the local database
          await taskDB.addTask(newTask);
          // Add the task to the state
          set((state) => ({ tasks: [...state.tasks, newTask] }));

          // Set reminder notification
          if (newTask.reminder) {
            const { addNotification } = useNotifications.getState();
            const reminderDate = new Date(newTask.reminder);

            if (reminderDate > new Date()) {
              const timeoutId = setTimeout(() => {
                addNotification({
                  title: "Task Reminder",
                  message: `Reminder for task: ${newTask.title}`,
                  taskId: newTask.id,
                });
              }, reminderDate.getTime() - Date.now());
              // Store this timeout ID to clear
            }
          }
          return newTask;
        } catch (error) {
          console.error("Error creating task:", error);
          throw error;
        }
      },

      updateTask: async (task: Task, userMode: UserMode) => {
        const updatedTask = {
          ...task,
          updatedAt: new Date().toISOString(),
        };
        try {
          if (userMode === "online-user") {
            await api.updateTask(updatedTask);
          } else if (userMode === "offline-user") {
            const syncAction: SyncTask = {
              action: "update",
              task: { ...updatedTask } as Task,
              timestamp: Date.now(),
            };
            set((state) => ({
              pendingSync: [...state.pendingSync, syncAction],
            }));
          }
          // Update the task in the local database
          await taskDB.updateTask(updatedTask);
          // Update the task in the state
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === task.id ? updatedTask : t)),
          }));
          return updatedTask;
        } catch (error) {
          console.error("Error updating task:", error);
          throw error;
        }
      },

      deleteTask: async (id: string, userMode: UserMode) => {
        try {
          if (userMode === "online-user") {
            // Delete the task from the server
            await api.deleteTask(id);
          } else if (userMode === "offline-user") {
            const syncAction: SyncTask = {
              action: "delete",
              task: id,
              timestamp: Date.now(),
            };
            set((state) => ({
              pendingSync: [...state.pendingSync, syncAction],
            }));
          }
          // Remove the task from the local database
          await taskDB.deleteTask(id);
          // Remove the task from the state
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          }));
        } catch (error) {
          console.error("Error deleting task:", error);
          throw error;
        }
      },

      // Run after getting online
      syncTasks: async () => {
        const { pendingSync } = get();
        if (pendingSync.length === 0) return;
        try {
          //Check the pending sync tasks and sync them
          if (pendingSync.length > 0) {
            //if no pending sync tasks???????
            for (const syncTask of pendingSync) {
              if (syncTask.action === "add") {
                await api.createTask(syncTask.task as Task);
              } else if (syncTask.action === "update") {
                await api.updateTask(syncTask.task as Task);
              } else if (syncTask.action === "delete") {
                await api.deleteTask(syncTask.task as string);
              }
            }
            // clear pending sync tasks
            set({ pendingSync: [] });
          }
        } catch (error) {
          console.error("Error syncing tasks:", error);
        }
      },

      // Run after login
      mergeTasks: async () => {
        try {
          const mergedMap = new Map<string, Task>();
          const auth = getLocalStorageItem<AuthState>("auth", {} as AuthState);
          const userId = auth.user!.id;
          // Get all tasks from server
          const serverTasks = await api.fetchServerTasks();
          const localTasks = await taskDB.getAllTasks();

          for (const task of serverTasks) {
            mergedMap.set(task.id, task);
          }

          for (const guestTask of localTasks) {
            const existing = mergedMap.get(guestTask.id);

            if (!existing) {
              // Task is only in guest: assign userId and add
              mergedMap.set(guestTask.id, { ...guestTask, userId });
            } else {
              // Conflict: pick the latest one by updatedAt
              const guestUpdated = new Date(guestTask.updatedAt).getTime();
              const serverUpdated = new Date(existing.updatedAt).getTime();

              if (guestUpdated > serverUpdated) {
                mergedMap.set(guestTask.id, { ...guestTask, userId });
              }
            }
          }

          const mergedTasks = Array.from(mergedMap.values());

          // Merge to local db
          await taskDB.mergeTasks(mergedTasks);

          // Merge to server
          await api.mergeTasks(mergedTasks);
          set({ tasks: [...mergedTasks] });
        } catch (error) {
          console.error("Error merging tasks:", error);
        }
      },

      removeLocalTasks: async () => {
        try {
          await taskDB.clearTasks();
          set({ tasks: [] });
        } catch (error) {
          console.error("Error removing local tasks:", error);
        }
      },
    }),

    {
      name: "task-store", // unique name for the store
      partialize: (state) => ({
        pendingSync: state.pendingSync,
      }), // only persist pendingSync
    }
  )
);
