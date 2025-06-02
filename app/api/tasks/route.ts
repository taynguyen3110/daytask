import { NextResponse } from "next/server";
import type { Task } from "@/lib/types";

// This is a mock API route for demonstration purposes
// In a real application, this would connect to a database

export const tasks: Task[] = [];

export async function GET() {
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();

  // Validate required fields
  if (!body.title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const newTask: Task = {
    id: crypto.randomUUID(),
    title: body.title,
    description: body.description,
    completed: false,
    dueDate: body.dueDate,
    priority: body.priority || "medium",
    labels: body.labels,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurrence: body.recurrence,
    reminder: body.reminder,
    snoozedUntil: body.snoozedUntil,
    userId: body.userId || null,
  };

  tasks.push(newTask);

  return NextResponse.json(newTask, { status: 201 });
}
