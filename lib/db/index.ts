import Dexie, { Table } from "dexie";
import { Task, Note, Notification, Settings, User } from "@/lib/types";

class TaskMasterDB extends Dexie {
  tasks!: Table<Task>;
  notes!: Table<Note>;
  notifications!: Table<Notification>;
  settings!: Table<Settings>;
  users!: Table<User>;

  constructor() {
    super("TaskMasterDB");
    this.version(1).stores({
      tasks: "id, title, completed, dueDate, priority, labels, userId",
      notes: "id, content, createdAt, updatedAt",
      notifications: "id, title, read, createdAt, taskId",
      settings: "id", // Single record table
      users: "id, username, email",
    });
  }
}

export const db = new TaskMasterDB();

export const taskDB = {
  async addTask(task: Task) {
    await db.tasks.add(task);
  },

  async getTask(id: string): Promise<Task | undefined> {
    return db.tasks.get(id);
  },

  async getAllTasks(): Promise<Task[]> {
    return db.tasks.toArray();
  },

  async updateTask(task: Task) {
    await db.tasks.put(task);
  },

  async deleteTask(id: string) {
    await db.tasks.delete(id);
  },
};

export const noteDB = {
  async addNote(note: Note) {
    await db.notes.add(note);
  },

  async getNote(id: string): Promise<Note | undefined> {
    return db.notes.get(id);
  },

  async getAllNotes(): Promise<Note[]> {
    return db.notes.toArray();
  },

  async updateNote(note: Note) {
    await db.notes.put(note);
  },

  async deleteNote(id: string) {
    await db.notes.delete(id);
  },
};

export const notificationDB = {
  async addNotification(notification: Notification) {
    await db.notifications.add(notification);
  },

  async getNotification(id: string): Promise<Notification | undefined> {
    return db.notifications.get(id);
  },

  async getAllNotifications(): Promise<Notification[]> {
    return db.notifications.toArray();
  },

  async markAsRead(id: string) {
    const notification = await db.notifications.get(id);
    if (notification) {
      notification.read = true;
      await db.notifications.put(notification);
    }
  },

  async deleteNotification(id: string) {
    await db.notifications.delete(id);
  },
};

export const settingsDB = {
  async getSettings(): Promise<Settings | undefined> {
    return db.settings.get("settings");
  },

  async updateSettings(settings: Settings) {
    await db.settings.put({ ...settings, id: "settings" });
  },
};