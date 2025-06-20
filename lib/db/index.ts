import Dexie, { Table } from "dexie";
import { Task, Note, Notification, Settings, User } from "@/lib/types";
import { clear } from "console";

class DayTaskDB extends Dexie {
  tasks!: Table<Task>;
  notes!: Table<Note>;
  notifications!: Table<Notification>;
  settings!: Table<Settings>;
  users!: Table<User>;

  constructor() {
    super("DayTaskDB");
    this.version(1).stores({
      tasks: "id, title, completed, dueDate, priority, labels, userId",
      notes: "id, content, createdAt, updatedAt",
      notifications: "id, title, read, createdAt, taskId",
      settings: "id", // Single record table
      users: "id, username, email",
    });
  }
}

export const db = new DayTaskDB();

export const taskDB = {
  async addTask(task: Task) {
    const newTask = {
      ...task,
      dueDate: new Date(task.dueDate!).toISOString(),
    };
    await db.tasks.add(newTask);
  },

  async mergeTasks(tasks: Task[]) {
    try {
      await db.tasks.bulkPut(tasks);
    } catch (error) {
      console.error("Dexie bulkAdd failed:", error, tasks);
      throw error;
    }
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

  async clearTasks() {
    await clearTable(db.tasks);
  },

  async syncAllTasks(newTasks: Task[]) {
    await replaceAllItems(db.tasks, newTasks);
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

  async mergeNotes(notes: Note[]) {
    try {
      await db.notes.bulkPut(notes);
    } catch (error) {
      console.error("Dexie bulkAdd failed:", error, notes);
      throw error;
    }
  },

  async deleteNote(id: string) {
    await db.notes.delete(id);
  },

  async clearNotes() {
    await clearTable(db.notes);
  },

  async syncAllNotes(newNotes: Note[]) {
    await replaceAllItems(db.notes, newNotes);
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

  async syncAllNotifications(newNotifications: Notification[]) {
    await replaceAllItems(db.notifications, newNotifications);
  },
};

export const settingsDB = {
  async getSettings(): Promise<Settings | undefined> {
    return db.settings.get("settings");
  },

  async updateSettings(settings: Settings) {
    await db.settings.put(settings);
  },

  async syncSettings(settings: Settings) {
    await db.settings.put(settings);
  },
};

const replaceAllItems = async <T>(table: Table<T>, newItems: T[]) => {
  await table.db.transaction("rw", table, async () => {
    await table.clear(); // Clear old tasks
    await table.bulkAdd(newItems); // Add new ones
  });
};

const clearTable = async <T>(table: Table<T>) => {
  await table.clear();
};
