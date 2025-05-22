"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Bell,
  Repeat,
  Tag,
  AlarmClock,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { SnoozeDialog } from "@/components/tasks/snooze-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTaskStore } from "@/lib/stores/task-store";
import type { Task } from "@/lib/types";
import { formatDistanceToNow, isPast, isToday, format } from "date-fns";
import { cn } from "@/lib/utils";
import { useMode } from "@/lib/hooks/use-mode";

interface TaskDetailProps {
  id: string;
}

export function TaskDetail({ id }: TaskDetailProps) {
  const router = useRouter();
  const { tasks, fetchTasks, updateTask, deleteTask } = useTaskStore();
  const [task, setTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSnoozeDialogOpen, setIsSnoozeDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const {userMode} = useMode();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const foundTask = tasks.find((t) => t.id === id);
    if (foundTask) {
      setTask(foundTask);
    } else if (tasks.length > 0) {
      // Task not found, redirect to tasks page
      router.push("/tasks");
    }
  }, [tasks, id, router]);

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading task...</h2>
        </div>
      </div>
    );
  }

  const handleToggleComplete = () => {
    updateTask({
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : undefined,
    }, userMode);
  };

  const handleDelete = () => {
    deleteTask(task.id, userMode);
    router.push("/tasks");
  };

  const getPriorityBadge = () => {
    switch (task.priority) {
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

  const getRecurrenceBadge = () => {
    if (!task.recurrence) return null;

    let text = "";
    switch (task.recurrence) {
      case "daily":
        text = "Daily";
        break;
      case "weekly":
        text = "Weekly";
        break;
      case "monthly":
        text = "Monthly";
        break;
      default:
        text = task.recurrence;
    }

    return (
      <Badge
        variant="outline"
        className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      >
        <Repeat className="mr-1 h-3 w-3" />
        {text}
      </Badge>
    );
  };

  const getDueDateText = () => {
    if (!task.dueDate) return "No due date";

    const dueDate = new Date(task.dueDate);

    if (task.snoozedUntil && new Date(task.snoozedUntil) > new Date()) {
      return (
        <span className="flex items-center">
          <AlarmClock className="mr-2 h-4 w-4" />
          Snoozed until {format(new Date(task.snoozedUntil), "PPP")}
        </span>
      );
    }

    if (isPast(dueDate) && !isToday(dueDate)) {
      return (
        <span className="flex items-center text-destructive">
          <Calendar className="mr-2 h-4 w-4" />
          Overdue by {formatDistanceToNow(dueDate)}
        </span>
      );
    }

    return (
      <span className="flex items-center">
        <Calendar className="mr-2 h-4 w-4" />
        Due {format(dueDate, "PPP")} (
        {formatDistanceToNow(dueDate, { addSuffix: true })})
      </span>
    );
  };

  const getReminderText = () => {
    if (!task.reminder) return "No reminder set";

    return (
      <span className="flex items-center">
        <Bell className="mr-2 h-4 w-4" />
        Reminder set for {format(new Date(task.reminder), "PPP")}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/tasks")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleToggleComplete}
            className="h-5 w-5"
          />
          <h1
            className={cn(
              "text-2xl font-bold tracking-tight",
              task.completed && "line-through opacity-70"
            )}
          >
            {task.title}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSnoozeDialogOpen(true)}
          >
            <AlarmClock className="mr-2 h-4 w-4" />
            Snooze
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {getPriorityBadge()}
        {getRecurrenceBadge()}
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

      {task.description && (
        <Card>
          <CardContent className="pt-6">
            <div className="whitespace-pre-wrap">{task.description}</div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Due Date</h3>
            <div className="text-muted-foreground">{getDueDateText()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Reminder</h3>
            <div className="text-muted-foreground">{getReminderText()}</div>
          </CardContent>
        </Card>
      </div>

      {task.completed && task.completedAt && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Completion</h3>
            <div className="text-muted-foreground">
              Completed on {format(new Date(task.completedAt), "PPP")} (
              {formatDistanceToNow(new Date(task.completedAt), {
                addSuffix: true,
              })}
              )
            </div>
          </CardContent>
        </Card>
      )}

      <TaskDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={task}
      />

      <SnoozeDialog
        open={isSnoozeDialogOpen}
        onOpenChange={setIsSnoozeDialogOpen}
        task={task}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
