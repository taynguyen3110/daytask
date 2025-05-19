import { ApiResponse, AuthState, Task } from "../types";
import api from "./axios";
import { generateId } from "@/lib/utils";
import { taskDB } from "../db";
import { useMode } from "../hooks/use-mode";

const URL = "/task";
export const taskService = {
  //   async fetchTasks(): Promise<Task[]> {
  //   const { userMode, currentUser } = useMode();
  //   if (userMode === "authenticated") {
  //     const userId = currentUser?.id;
  //     // fetch tasks from API of userID
  //     const response = await api.get<Task[]>(`${URL}/user/${userId}`);
  //     if (response.status == 204) {
  //       return [];
  //     }
  //     return response.data;
  //   } else {
  //     //if offline, fetch from indexedDB
  //     return await taskDB.getAllTasks();
  //   }
  // },

  async fetchLocalTasks(): Promise<Task[]> {
    return await taskDB.getAllTasks();
  },

  async fetchServerTasks(): Promise<Task[]> {
    const { currentUser } = useMode();
    const userId = currentUser?.id;
    // fetch tasks from API of userID
    const response = await api.get<Task[]>(`${URL}/user/${userId}`);
    if (response.status == 204) {
      return [];
    }
    return response.data;
  },

  async createTask(task: Task): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>(`${URL}`, task);
    return response.data.data!;
  },

  async createTasks(tasks: Task[]): Promise<Task[]> {
    const response = await api.post<ApiResponse<Task[]>>(`${URL}/bulk`, tasks);
    return response.data.data!;
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
