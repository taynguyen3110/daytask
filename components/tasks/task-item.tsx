"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Calendar,
  Bell,
  Repeat,
  Tag,
  AlarmClock,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { SnoozeDialog } from "@/components/tasks/snooze-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTaskStore } from "@/lib/stores/task-store";
import type { Task } from "@/lib/types";
import { formatDistanceToNow, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { useMode } from "@/lib/hooks/use-mode";

interface TaskItemProps {
  task: Task;
}

export const getRecurrenceBadge = (task: Task) => {
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

export function TaskItem({ task }: TaskItemProps) {
  const { updateTask, deleteTask } = useTaskStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSnoozeDialogOpen, setIsSnoozeDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { userMode } = useMode();

  const handleToggleComplete = () => {
    updateTask(
      {
        ...task,
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null,
      },
      userMode
    );
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

  const getDueDateText = () => {
    if (!task.dueDate) return null;
    const dueDate = new Date(task.dueDate);
    if (task.snoozedUntil && new Date(task.snoozedUntil) > new Date()) {
      return (
        <span className="flex items-center text-xs text-muted-foreground">
          <AlarmClock className="mr-1 h-3 w-3" />
          Snoozed until{" "}
          {formatDistanceToNow(new Date(task.snoozedUntil), {
            addSuffix: true,
          })}
        </span>
      );
    }

    if (isPast(dueDate) && !isToday(dueDate)) {
      return (
        <span className="flex items-center text-xs text-destructive">
          <Calendar className="mr-1 h-3 w-3" />
          Overdue by {formatDistanceToNow(dueDate)}
        </span>
      );
    }

    return (
      <span className="flex items-center text-xs text-muted-foreground">
        <Calendar className="mr-1 h-3 w-3" />
        Due {formatDistanceToNow(dueDate, { addSuffix: true })}
      </span>
    );
  };

  const getReminderText = () => {
    if (!task.reminder) return null;

    return (
      <span className="flex items-center text-xs text-muted-foreground">
        <Bell className="mr-1 h-3 w-3" />
        Reminder{" "}
        {formatDistanceToNow(new Date(task.reminder), { addSuffix: true })}
      </span>
    );
  };

  return (
    <>
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
          task.completed && "task-completed"
        )}
      >
        <Checkbox
          checked={task.completed ?? undefined}
          onCheckedChange={handleToggleComplete}
          className="mt-0.5"
        />

        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-medium">{task.title}</div>
            <div className="flex flex-wrap gap-2">
              {getPriorityBadge()}
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
            <div className="text-sm text-muted-foreground">
              {task.description}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {getDueDateText()}
            {getReminderText()}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsSnoozeDialogOpen(true)}
              disabled={!!task.completed}
            >
              Snooze
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
        onConfirm={() => deleteTask(task.id, userMode)}
      />
    </>
  );
}
