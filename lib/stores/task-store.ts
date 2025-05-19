"use client";

import { create } from "zustand";
import type { SyncTask, Task } from "@/lib/types";
import { useNotifications } from "@/lib/hooks/use-notifications";
import api from "@/lib/api";
import { useMode } from "../hooks/use-mode";
import { taskDB } from "../db";
import { generateId } from "../utils";

interface TaskStore {
  tasks: Task[];
  pendingSync: SyncTask[];
  fetchTasks: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (task: Task) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  syncTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  pendingSync: [],

  fetchTasks: async () => {
    try {
      // fetch tasks from indexedDB
      let tasks = await api.fetchLocalTasks();
      tasks = tasks.map((task) => {
        return {
          ...task,
          dueDate: new Date(task.dueDate! + "Z").toLocaleString(),
          createdAt: new Date(task.createdAt! + "Z").toLocaleString(),
          updatedAt: new Date(task.updatedAt! + "Z").toLocaleString(),
          completedAt: new Date(task.completedAt! + "Z").toLocaleString(),
          reminder: new Date(task.reminder! + "Z").toLocaleString(),
          snoozedUntil: new Date(task.snoozedUntil! + "Z").toLocaleString(),
        };
      });
      set({ tasks });
    } catch (error) {}
  },

  createTask: async (task: Partial<Task>) => {
    const { userMode, currentUser } = useMode();
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
        await api.createTask(newTask);
      } else if (userMode === "offline-user") {
        const syncAction: SyncTask = {
          action: "add",
          task: { ...newTask } as Task,
          timestamp: Date.now(),
        };
        set((state) => ({ pendingSync: [...state.pendingSync, syncAction] }));
      }
      await taskDB.addTask(newTask);

      // Set reminder notification if needed
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
          // Store this timeout ID to clear it if needed
        }
      }
      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  updateTask: async (task: Task) => {
    const { userMode } = useMode();
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
      await taskDB.updateTask(task);
      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    const { userMode } = useMode();
    try {
      if (userMode === "online-user") {
        await api.deleteTask(id);
      } else if (userMode === "offline-user") {
        const syncAction: SyncTask = {
          action: "delete",
          task: id,
          timestamp: Date.now(),
        };
        set((state) => ({ pendingSync: [...state.pendingSync, syncAction] }));
      }
      await taskDB.deleteTask(id);
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  // Run after login
  syncTasks: async () => {
    try {
      // get all tasks from server
      const serverTasks = await api.fetchServerTasks();
      const localTasks = await taskDB.getAllTasks();
      if (localTasks.length === 0) {
        await taskDB.addTasks(serverTasks);
        set({ tasks: serverTasks });
      } else {
        // check the pending sync tasks and sync them
        const pendingSync = get().pendingSync;
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
      // set indexedDB
    } catch (error) {
      console.error("Error syncing tasks:", error);
    }
  },
}));
