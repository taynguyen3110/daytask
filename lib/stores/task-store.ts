"use client";

import { create } from "zustand";
import type { AuthState, SyncTask, Task, UserMode } from "@/lib/types";
import { useNotifications } from "@/lib/hooks/use-notifications";
import api from "@/lib/api";
import { taskDB } from "../db";
import { generateId, getLocalStorageItem } from "../utils";

interface TaskStore {
  tasks: Task[];
  pendingSync: SyncTask[];
  fetchTasks: () => Promise<void>;
  createTask: (task: Partial<Task>, userMode: UserMode) => Promise<Task>;
  updateTask: (task: Task, userMode: UserMode) => Promise<Task>;
  deleteTask: (id: string, userMode: UserMode) => Promise<void>;
  syncTasks: () => Promise<void>;
  updateTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  pendingSync: [],

  fetchTasks: async () => {
    try {
      // Fetch tasks from indexedDB
      let tasks = await api.fetchLocalTasks();
      tasks = tasks.map((task) => {
        return {
          ...task,
          // dueDate: new Date(task.dueDate! + "Z").toLocaleString(),
          // createdAt: new Date(task.createdAt! + "Z").toLocaleString(),
          // updatedAt: new Date(task.updatedAt! + "Z").toLocaleString(),
          // completedAt: new Date(task.completedAt! + "Z").toLocaleString(),
          // reminder: new Date(task.reminder! + "Z").toLocaleString(),
          // snoozedUntil: new Date(task.snoozedUntil! + "Z").toLocaleString(),
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
      recurrence: task.recurrence,
      reminder: task.reminder,
      snoozedUntil: task.snoozedUntil,
      userId: currentUser?.id || "",
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
        set((state) => ({ pendingSync: [...state.pendingSync, syncAction] }));
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
        set((state) => ({ pendingSync: [...state.pendingSync, syncAction] }));
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
        set((state) => ({ pendingSync: [...state.pendingSync, syncAction] }));
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
    try {
      // For offline -> online user flow
      // const serverTasks = await api.fetchServerTasks();
      // await taskDB.addTasks(serverTasks);
      // set((state) => ({ tasks: [...state.tasks, ...serverTasks] }));

      //Check the pending sync tasks and sync them
      const pendingSync = get().pendingSync;
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
  updateTasks: async () => {
    try {
      // Get all tasks from server
      const serverTasks = await api.fetchServerTasks();
      const localTasks = await taskDB.getAllTasks();
      // Merge online and offline tasks and update all db
      await taskDB.addTasks(serverTasks);
      await api.createTasks(localTasks);
      set({ tasks: [...localTasks, ...serverTasks] });
    } catch (error) {
      console.error("Error syncing tasks:", error);
    }
  },
}));
