import { toast } from "@/components/ui/use-toast";
import api from "./axios";
import { ApiResponse } from "../types";

export const telegramService = {
  async initiate(userId: string): Promise<void> {
    await fetch("/api/telegram/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: userId,
      }),
    });
  },

  async sendMessage(userId: string, message: string): Promise<void> {
    await fetch("/api/telegram/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: userId,
        message,
      }),
    });
  },

  async linkTelegramToUser(userId: string, chatId: string): Promise<boolean> {
    const response = await api.post(`/telegram`, {
      userId,
      chatId,
    });
    return response.data.success;
  },

  async unlinkTelegramFromUser(userId: string): Promise<boolean> {
    const response = await api.delete(
      `/telegram/${userId}`
    );
    return response.data.success;
  },
};
