"use client";

import { create } from "zustand";
import type { Task } from "@/lib/types";
import {
  generateId,
  getLocalStorageItem,
  setLocalStorageItem,
} from "@/lib/utils";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { tasks } from "@/app/api/tasks/route";

interface TaskStore {
  tasks: Task[];
  pendingSync: number;
  fetchTasks: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (task: Task) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  syncTasks: () => Promise<void>;
}

// Mock API functions
const api = {
  fetchTasks: async (): Promise<Task[]> => {
    // In a real app, this would be an API call
    // return getLocalStorageItem<Task[]>("tasks", [])
    return tasks;
  },

  createTask: async (task: Partial<Task>): Promise<Task> => {
    // In a real app, this would be an API call
    const tasks = getLocalStorageItem<Task[]>("tasks", []);
    const newTask: Task = {
      id: generateId(),
      title: task.title || "",
      description: task.description,
      completed: false,
      dueDate: task.dueDate,
      priority: task.priority || "medium",
      labels: task.labels,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recurrence: task.recurrence,
      reminder: task.reminder,
      snoozedUntil: task.snoozedUntil,
    };

    tasks.push(newTask);
    setLocalStorageItem("tasks", tasks);
    return newTask;
  },

  updateTask: async (task: Task): Promise<Task> => {
    // In a real app, this would be an API call
    const tasks = getLocalStorageItem<Task[]>("tasks", []);
    const index = tasks.findIndex((t) => t.id === task.id);

    if (index !== -1) {
      tasks[index] = {
        ...task,
        updatedAt: new Date().toISOString(),
      };
      setLocalStorageItem("tasks", tasks);
    }

    return task;
  },

  deleteTask: async (id: string): Promise<void> => {
    // In a real app, this would be an API call
    const tasks = getLocalStorageItem<Task[]>("tasks", []);
    const filteredTasks = tasks.filter((task) => task.id !== id);
    setLocalStorageItem("tasks", filteredTasks);
  },
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  pendingSync: 0,

  fetchTasks: async () => {
    try {
      const tasks = await api.fetchTasks();
      set({ tasks });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  },

  createTask: async (task: Partial<Task>) => {
    try {
      set((state) => ({ pendingSync: state.pendingSync + 1 }));
      const newTask = await api.createTask(task);

      set((state) => ({
        tasks: [...state.tasks, newTask],
        pendingSync: state.pendingSync - 1,
      }));

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

          // In a real app, we would store this timeout ID to clear it if needed
        }
      }

      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      set((state) => ({ pendingSync: state.pendingSync - 1 }));
      throw error;
    }
  },

  updateTask: async (task: Task) => {
    try {
      set((state) => ({ pendingSync: state.pendingSync + 1 }));
      const updatedTask = await api.updateTask(task);

      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === task.id ? updatedTask : t)),
        pendingSync: state.pendingSync - 1,
      }));

      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
      set((state) => ({ pendingSync: state.pendingSync - 1 }));
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    try {
      set((state) => ({ pendingSync: state.pendingSync + 1 }));
      await api.deleteTask(id);

      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        pendingSync: state.pendingSync - 1,
      }));
    } catch (error) {
      console.error("Error deleting task:", error);
      set((state) => ({ pendingSync: state.pendingSync - 1 }));
      throw error;
    }
  },

  syncTasks: async () => {
    // In a real app, this would sync local changes with the server
    try {
      const tasks = await api.fetchTasks();
      set({ tasks });
    } catch (error) {
      console.error("Error syncing tasks:", error);
    }
  },
}));
