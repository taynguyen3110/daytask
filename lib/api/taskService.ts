import { ApiResponse, AuthState, Task } from "../types";
import api from "./axios";
import { generateId, getLocalStorageItem } from "@/lib/utils";
import { taskDB } from "../db";

const URL = "/task";
export const taskService = {
  async fetchLocalTasks(): Promise<Task[]> {
    return await taskDB.getAllTasks();
  },

  async fetchServerTasks(): Promise<Task[]> {
    const auth = getLocalStorageItem<AuthState>("auth", {} as AuthState);
    const userId = auth.user?.id;
    // fetch tasks from API of userID
    const response = await api.get<ApiResponse<Task[]>>(`${URL}/user/${userId}`);
    if (response.status == 204) {
      return [];
    }
    return response.data.data!;
  },

  async createTask(task: Task): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>(`${URL}`, task);
    return response.data.data!;
  },

  async createTasks(tasks: Task[]): Promise<Task[]> {
    const response = await api.post<ApiResponse<Task[]>>(`${URL}/bulk`, tasks);
    return response.data.data!;
  },

  async mergeTasks(tasks: Task[]): Promise<void> {
    const response = await api.post<ApiResponse<void>>(`${URL}/merge`, tasks);
  },

  async updateTask(task: Task): Promise<Task> {
    const response = await api.put<ApiResponse<Task>>(
      `${URL}/${task.id}`,
      task
    );
    return response.data.data!;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`${URL}/${id}`);
  },
};
