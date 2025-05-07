import { NextResponse } from "next/server"
import type { Task } from "@/lib/types"

// This is a mock API route for demonstration purposes
// In a real application, this would connect to a database

let tasks: Task[] = []

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const task = tasks.find((t) => t.id === params.id)

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  return NextResponse.json(task)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const index = tasks.findIndex((t) => t.id === params.id)

  if (index === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  // Validate required fields
  if (!body.title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const updatedTask: Task = {
    ...tasks[index],
    ...body,
    id: params.id,
    updatedAt: new Date().toISOString(),
  }

  tasks[index] = updatedTask

  return NextResponse.json(updatedTask)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const index = tasks.findIndex((t) => t.id === params.id)

  if (index === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  tasks = tasks.filter((t) => t.id !== params.id)

  return NextResponse.json({ success: true })
}
