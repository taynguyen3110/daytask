"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTaskStore } from "@/lib/stores/task-store"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/lib/types"
import { getNextOccurrence } from "@/lib/utils"

export function RecurringTasks() {
  const { tasks } = useTaskStore()
  const [recurringTasks, setRecurringTasks] = useState<(Task & { nextOccurrence: Date })[]>([])

  useEffect(() => {
    const filtered = tasks
      .filter((task) => task.recurrence && !task.completed)
      .map((task) => ({
        ...task,
        nextOccurrence: getNextOccurrence(task),
      }))
      .sort((a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime())
      .slice(0, 3)

    setRecurringTasks(filtered)
  }, [tasks])

  const getRecurrenceText = (recurrence: string) => {
    switch (recurrence) {
      case "daily":
        return "Every day"
      case "weekly":
        return "Every week"
      case "monthly":
        return "Every month"
      default:
        return recurrence
    }
  }

  return (
    <Card className="h-[370px] overflow-y-auto">
      <CardHeader>
        <CardTitle>Recurring Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {recurringTasks.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">No active recurring tasks</div>
        ) : (
          <div className="space-y-4">
            {recurringTasks.map((task) => (
              <div key={task.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{task.title}</div>
                  <Badge
                    variant="outline"
                    className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                  >
                    {getRecurrenceText(task.recurrence!)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">Next: {task.nextOccurrence.toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
