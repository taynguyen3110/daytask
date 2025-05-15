import {
  generateId,
  getLocalStorageItem,
  setLocalStorageItem,
} from "@/lib/utils";
import type { Note, Task } from "@/lib/types";
import importedTasks from "./completed_tasks.json";

export const mockApi = {
  fetchNotes: async (): Promise<Note[]> => {
    // In a real app, this would be an API call
    return getLocalStorageItem<Note[]>("notes", []);
  },

  createNote: async (note: Partial<Note>): Promise<Note> => {
    // In a real app, this would be an API call
    const notes = getLocalStorageItem<Note[]>("notes", []);
    const newNote: Note = {
      id: generateId(),
      content: note.content || "",
      createdAt: note.createdAt || new Date().toISOString(),
      updatedAt: note.updatedAt || new Date().toISOString(),
    };

    notes.push(newNote);
    setLocalStorageItem("notes", notes);
    return newNote;
  },

  updateNote: async (note: Note): Promise<Note> => {
    // In a real app, this would be an API call
    const notes = getLocalStorageItem<Note[]>("notes", []);
    const index = notes.findIndex((n) => n.id === note.id);

    if (index !== -1) {
      notes[index] = {
        ...note,
        updatedAt: new Date().toISOString(),
      };
      setLocalStorageItem("notes", notes);
    }

    return note;
  },

  deleteNote: async (id: string): Promise<void> => {
    // In a real app, this would be an API call
    const notes = getLocalStorageItem<Note[]>("notes", []);
    const filteredNotes = notes.filter((note) => note.id !== id);
    setLocalStorageItem("notes", filteredNotes);
  },

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

const tasks: Task[] = [
  {
    id: crypto.randomUUID(),
    title: "Daily Standup Meeting",
    description: "Attend the team’s daily sync meeting",
    completed: false,
    dueDate: "2025-05-16",
    priority: "medium",
    labels: ["work", "meeting"],
    createdAt: "2025-05-01",
    updatedAt: "2025-05-15",
    recurrence: "daily",
  },
  {
    id: crypto.randomUUID(),
    title: "Weekly Review",
    description: "Review weekly goals and progress",
    completed: false,
    dueDate: "2025-05-17",
    priority: "high",
    labels: ["review", "productivity"],
    createdAt: "2025-04-01",
    updatedAt: "2025-05-14",
    recurrence: "weekly",
  },
  {
    id: crypto.randomUUID(),
    title: "Pay Rent",
    description: "Transfer rent to landlord",
    completed: false,
    dueDate: "2025-06-01",
    priority: "high",
    labels: ["finance"],
    createdAt: "2025-01-01",
    updatedAt: "2025-05-01",
    recurrence: "monthly",
  },
  {
    id: crypto.randomUUID(),
    title: "Water Plants",
    description: "Water indoor plants",
    completed: false,
    dueDate: "2025-05-16",
    priority: "low",
    labels: ["home"],
    createdAt: "2025-04-15",
    updatedAt: "2025-05-15",
    recurrence: "every 3 days",
  },
  {
    id: crypto.randomUUID(),
    title: "Backup Computer",
    description: "Create a system backup",
    completed: false,
    dueDate: "2025-05-30",
    priority: "medium",
    labels: ["tech", "maintenance"],
    createdAt: "2025-03-01",
    updatedAt: "2025-05-01",
    recurrence: "monthly",
  },

  // ✅ Snoozed tasks
  {
    id: "206",
    title: "Call Dentist",
    description: "Schedule a dental cleaning appointment",
    completed: false,
    dueDate: "2025-05-16",
    priority: "high",
    labels: ["health"],
    createdAt: "2025-04-10",
    updatedAt: "2025-05-10",
    snoozedUntil: "2025-05-20",
  },
  {
    id: "207",
    title: "Organize Desk",
    description: "Tidy and clean up workspace",
    completed: false,
    dueDate: "2025-05-14",
    priority: "low",
    labels: ["home", "cleaning"],
    createdAt: "2025-04-01",
    updatedAt: "2025-05-13",
    snoozedUntil: "2025-05-18",
  },
  {
    id: "208",
    title: "Write Blog Post",
    description: "Draft blog article on TypeScript tips",
    completed: false,
    dueDate: "2025-05-15",
    priority: "medium",
    labels: ["writing", "blog"],
    createdAt: "2025-04-20",
    updatedAt: "2025-05-14",
    snoozedUntil: "2025-05-21",
  },
  {
    id: "209",
    title: "Update Resume",
    description: "Add recent projects and update formatting",
    completed: false,
    dueDate: "2025-05-10",
    priority: "high",
    labels: ["career"],
    createdAt: "2025-04-01",
    updatedAt: "2025-05-09",
    snoozedUntil: "2025-05-25",
  },
  {
    id: "210",
    title: "Read Book",
    description: 'Continue reading "Atomic Habits"',
    completed: false,
    dueDate: "2025-05-11",
    priority: "low",
    labels: ["leisure"],
    createdAt: "2025-04-15",
    updatedAt: "2025-05-10",
    snoozedUntil: "2025-05-22",
  },
  {
    id: crypto.randomUUID(),
    title: "Buy groceries",
    description: "Get milk, eggs, and bread from the supermarket.",
    completed: false,
    dueDate: "2025-05-10",
    priority: "high",
    labels: ["personal", "errand"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurrence: "weekly",
    reminder: "2025-05-09T10:00:00Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Team meeting",
    description: "Weekly sync with the product team.",
    completed: false,
    dueDate: "2025-05-08",
    priority: "medium",
    labels: ["work", "meeting"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurrence: "weekly",
    reminder: "2025-05-08T08:30:00Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Doctor appointment",
    description: "Annual checkup with Dr. Smith.",
    completed: false,
    dueDate: "2025-05-15",
    priority: "high",
    labels: ["health"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reminder: "2025-05-14T18:00:00Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Write blog post",
    description: "Publish article on React performance tips.",
    completed: false,
    dueDate: "2025-05-12",
    priority: "medium",
    labels: ["writing", "work"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Renew gym membership",
    description: "Renew membership before it expires.",
    completed: false,
    dueDate: "2025-05-11",
    priority: "low",
    labels: ["fitness"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurrence: "monthly",
    reminder: "2025-05-10T12:00:00Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Laundry",
    description: "Do a full load of laundry.",
    completed: false,
    dueDate: "2025-05-07",
    priority: "low",
    labels: ["home"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurrence: "weekly",
    snoozedUntil: "2025-05-08T09:00:00Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Prepare presentation",
    description: "Slides for Friday's marketing strategy review.",
    completed: false,
    dueDate: "2025-05-09",
    priority: "high",
    labels: ["work", "presentation"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reminder: "2025-05-08T15:00:00Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Read new book",
    description: "Start reading 'Atomic Habits'.",
    completed: false,
    dueDate: "2025-05-20",
    priority: "low",
    labels: ["personal", "reading"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Car services",
    description: "Oil change and general check-up.",
    completed: false,
    dueDate: "2025-05-13",
    priority: "high",
    labels: ["maintenance"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurrence: "yearly",
    reminder: "2025-05-12T08:00:00Z",
  },
    {
    id: crypto.randomUUID(),
    title: "Pick up kids",
    description: "Oil change and general check-up.",
    completed: false,
    dueDate: "2025-05-13",
    priority: "medium",
    labels: ["maintenance"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurrence: "weekly",
    reminder: "2025-05-12T08:00:00Z",
  },
    {
    id: crypto.randomUUID(),
    title: "Cook dinner",
    description: "Oil change and general check-up.",
    completed: false,
    dueDate: "2025-05-13",
    priority: "medium",
    labels: ["maintenance"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurrence: "daily",
    reminder: "2025-05-12T08:00:00Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Call plumber",
    description: "Fix leaking kitchen sink.",
    completed: false,
    dueDate: "2025-05-08",
    priority: "high",
    labels: ["home", "urgent"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reminder: "2025-05-07T17:00:00Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Review PRs",
    description: "Review open pull requests on GitHub.",
    completed: false,
    dueDate: "2025-05-07",
    priority: "medium",
    labels: ["code", "work"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurrence: "daily",
  },
  {
    id: crypto.randomUUID(),
    title: "Walk the dog",
    description: "Evening walk around the neighborhood.",
    completed: false,
    dueDate: "2025-05-07",
    priority: "low",
    labels: ["pet", "routine"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurrence: "daily",
    snoozedUntil: "2025-05-07T19:00:00Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Organize files",
    description: "Clean up desktop and documents folder.",
    completed: false,
    dueDate: "2025-05-14",
    priority: "low",
    labels: ["personal", "cleaning"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Pay electricity bill",
    description: "Bill due for the month of May.",
    completed: false,
    dueDate: "2025-05-10",
    priority: "high",
    labels: ["bills"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurrence: "monthly",
    reminder: "2025-05-09T10:00:00Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Plan weekend trip",
    description: "Decide location, book stay and car.",
    completed: false,
    dueDate: "2025-05-11",
    priority: "medium",
    labels: ["travel", "fun"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Water plants",
    description: "Indoor and balcony plants.",
    completed: false,
    dueDate: "2025-05-07",
    priority: "low",
    labels: ["routine", "home"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurrence: "daily",
    snoozedUntil: "2025-05-07T12:00:00Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Submit timesheet",
    description: "Don't forget to log hours for the week.",
    completed: false,
    dueDate: "2025-05-09",
    priority: "medium",
    labels: ["work"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurrence: "weekly",
    reminder: "2025-05-08T09:00:00Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Book dentist appointment",
    description: "Routine cleaning every 6 months.",
    completed: false,
    dueDate: "2025-05-20",
    priority: "low",
    labels: ["health"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurrence: "bi-yearly",
    reminder: "2025-05-19T14:00:00Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Upload portfolio",
    description: "Push updated case studies to portfolio site.",
    completed: false,
    dueDate: "2025-05-15",
    priority: "medium",
    labels: ["career", "work"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Backup phone data",
    description: "Sync photos and contacts to cloud.",
    completed: false,
    dueDate: "2025-05-18",
    priority: "low",
    labels: ["tech"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurrence: "monthly",
    reminder: "2025-05-17T17:00:00Z",
  },
  ...importedTasks,
];
