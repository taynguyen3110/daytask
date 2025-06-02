import api from "./axios";

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

  async linkTelegramToUser (userId: string, chatId: string): Promise<void> {
    const response = await api.post(`/telegram`, { userId, chatId });
  },

  async unlinkTelegramFromUser(userId: string): Promise<void> {
    const response = await api.delete(`/telegram/${userId}`);
  },

};
