import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid"
import type { Task } from "@/lib/types"
import { addDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return uuidv4()
}

export function getNextOccurrence(task: Task): Date {
  if (!task.recurrence) {
    return task.dueDate ? new Date(task.dueDate) : new Date()
  }

  const today = new Date()
  let baseDate = task.dueDate ? new Date(task.dueDate) : today

  // If the base date is in the past, start from today
  if (baseDate < today) {
    baseDate = today
  }

  switch (task.recurrence) {
    case "daily":
      return addDays(baseDate, 1)
    case "weekly":
      return addDays(baseDate, 7)
    case "monthly":
      const nextMonth = new Date(baseDate)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      return nextMonth
    default:
      return addDays(baseDate, 1)
  }
}

export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue
  }

  const storedValue = localStorage.getItem(key)
  if (storedValue === null) {
    return defaultValue
  }

  try {
    return JSON.parse(storedValue) as T
  } catch (error) {
    console.error(`Error parsing localStorage item ${key}:`, error)
    return defaultValue
  }
}

export function setLocalStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error)
  }
}
