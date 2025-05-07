"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskStore } from "@/lib/stores/task-store";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";
import type { Task } from "@/lib/types";
import { getRecurrenceBadge } from "../tasks/task-item";
import { Tag } from "lucide-react";

export function UpcomingTasks() {
  const { tasks, updateTask } = useTaskStore();
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);

  useEffect(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const filtered = tasks
      .filter(
        (task) =>
          !task.completed &&
          task.dueDate &&
          new Date(task.dueDate) >= now &&
          new Date(task.dueDate) <= sevenDaysFromNow
      )
      .sort(
        (a, b) =>
          new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
      )
      .slice(0, 5);

    setUpcomingTasks(filtered);
  }, [tasks]);

  const handleToggleComplete = (task: Task) => {
    updateTask({
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : undefined,
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return (
          <Badge variant="outline" className="task-priority-low">
            Low
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="task-priority-medium">
            Medium
          </Badge>
        );
      case "high":
        return (
          <Badge variant="outline" className="task-priority-high">
            High
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingTasks.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            No upcoming tasks for the next 7 days
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggleComplete(task)}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="font-medium">{task.title}</div>
                    <div className="flex gap-2 flex-wrap">
                      {getPriorityBadge(task.priority)}
                      {getRecurrenceBadge(task)}
                      {task.labels &&
                        task.labels.map((label) => (
                          <Badge
                            key={label}
                            variant="secondary"
                            className="flex items-center"
                          >
                            <Tag className="mr-1 h-3 w-3" />
                            {label}
                          </Badge>
                        ))}
                    </div>
                  </div>
                  {task.description && (
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {task.description}
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="text-xs text-muted-foreground">
                      Due{" "}
                      {formatDistanceToNow(new Date(task.dueDate), {
                        addSuffix: true,
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
