import { AuthState, Task } from "../types";
import api from "./axios";
import {
  generateId,
  getLocalStorageItem,
  setLocalStorageItem,
} from "@/lib/utils";

const URL = "/task";
export const taskService = {
  async fetchTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>(`${URL}`);
    if (response.status == 204) {
      return [];
    }
    return response.data;
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    const tasks = getLocalStorageItem<Task[]>("tasks", []);
    const authState = getLocalStorageItem<AuthState>("auth", {} as AuthState);
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
      userId: authState.user?.id || "", //handle userId in offline mode
    };

    tasks.push(newTask);
    setLocalStorageItem("tasks", tasks);
    const response = await api.post<Task>(`${URL}`, newTask);
    return response.data;
  },

  async updateTask(task: Task): Promise<Task> {
    const updatedTask = {
      ...task,
      updatedAt: new Date().toISOString(),
    }
    const response = await api.put<Task>(`${URL}/${updatedTask.id}`, updatedTask);
    const tasks = getLocalStorageItem<Task[]>("tasks", []);
    const index = tasks.findIndex((t) => t.id === task.id);

    // sync between local storage and DB if update to DB is unsuccessful
    if (index !== -1) {
      tasks[index] = updatedTask;
      setLocalStorageItem("tasks", tasks);
    }
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`${URL}/${id}`);
    // In a real app, this would be an API call
    const tasks = getLocalStorageItem<Task[]>("tasks", []);
    const filteredTasks = tasks.filter((task) => task.id !== id);
    setLocalStorageItem("tasks", filteredTasks);
  },
};
