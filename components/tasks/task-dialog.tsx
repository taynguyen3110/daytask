"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, CalendarIcon, Plus, Clock4Icon } from "lucide-react";
import { useTaskStore } from "@/lib/stores/task-store";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format, startOfToday, isSameDay, isBefore, isAfter } from "date-fns";
import { useMode } from "@/lib/hooks/use-mode";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  defaultDate?: string;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultDate,
}: TaskDialogProps) {
  const { createTask, updateTask } = useTaskStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<string>("medium");
  const [recurrence, setRecurrence] = useState<string | null>(null);
  const [reminder, setReminder] = useState<Date | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { userMode } = useMode();
  const dueTimeInputRef = useRef<HTMLInputElement>(null);
  const reminderTimeInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens/closes or task changes
  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || "");
        setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
        setPriority(task.priority || "medium");
        setRecurrence(task.recurrence);
        setReminder(task.reminder ? new Date(task.reminder) : null);
        setLabels(task.labels || []);
        setReminderEnabled(!!task.reminder);
      } else {
        setTitle("");
        setDescription("");
        setDueDate(defaultDate ? new Date(defaultDate) : new Date());
        setPriority("medium");
        setRecurrence(null);

        setReminder(
          defaultDate ? new Date(defaultDate) : dateAtTime(new Date(), 15)
        );
        setLabels([]);
      }
      setErrors({});
    }
  }, [open, task, defaultDate]);

  const dateAtTime = (date: string | Date, time: number): Date => {
    const newDate = new Date(date);
    newDate.setHours(time, 0, 0, 0);
    return newDate;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const taskData: Partial<Task> = {
      title,
      description: description || undefined,
      dueDate: dueDate?.toISOString(),
      priority,
      recurrence,
      reminder: reminderEnabled ? reminder?.toISOString() : null,
      labels: labels.length > 0 ? labels : undefined,
    };

    if (task) {
      updateTask(
        {
          ...task,
          ...taskData,
        },
        userMode
      );
    } else {
      createTask(taskData, userMode);
    }

    onOpenChange(false);
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel("");
    }
  };

  const handleRemoveLabel = (label: string) => {
    setLabels(labels.filter((l) => l !== label));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLabel();
    }
  };

  function combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  }

  const handleToggleReminder = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReminderEnabled(e.target.checked);
    if (!task) {
      // If creating a new task, set reminder based on due date
      if (!reminderEnabled) {
        // If enabling reminder, set it to the due date by default
        setReminder(dueDate ? new Date(dueDate) : new Date());
      } else {
        // If disabling reminder, clear it
        setReminder(null);
      }
    } else {
      // If editing an existing task, just toggle the state
      if (reminderEnabled) {
        // If disabling reminder, clear it
        setReminder(null);
      } else {
        // If enabling reminder, set it to the due date by default
        setReminder(
          task.reminder ? new Date(task.reminder as string) : new Date(dueDate!)
        );
      }
    }
  };

  const handleDueTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (dueDate) {
      const newTime = e.target.value; // format: "HH:mm"
      const newDueDate = combineDateAndTime(dueDate, newTime);

      const now = new Date();
      const isToday = isSameDay(dueDate, now);

      if (isToday && isBefore(newDueDate, now)) {
        // You can show a message here
        setErrors((prev) => ({
          ...prev,
          dueTime: "Due time cannot be in the past",
        }));
        // Optionally: reset the time input
        e.target.value = format(now, "HH:mm");
        setDueDate(combineDateAndTime(dueDate, format(now, "HH:mm")));
      } else {
        setErrors((prev) => {
          delete prev.dueTime;
          return { ...prev };
        });
        setDueDate(newDueDate);
        if (reminder) {
          processRemindTimeChange(format(reminder, "HH:mm"));
        }
      }
    }
  };

  const handleRemindTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value; // e.g. "HH:mm"
    const success = processRemindTimeChange(newTime);
    console.log(newTime);

    if (!success) {
      e.target.value = format(reminder!, "HH:mm"); // reset input if error
    }
  };

  const processRemindTimeChange = (newTime: string) => {
    if (reminder) {
      const newReminderDate = combineDateAndTime(reminder, newTime);

      if (dueDate) {
        const isSameDayAsDueDate = isSameDay(newReminderDate, dueDate);
        if (isSameDayAsDueDate) {
          if (isAfter(newReminderDate, dueDate)) {
            setErrors((prev) => ({
              ...prev,
              remindTime: "Reminder must be before task due",
            }));
            return false; // indicate failure
          }
        }
      }

      setErrors((prev) => {
        delete prev.remindTime;
        return { ...prev };
      });
      setReminder(newReminderDate);
      return true; // success
    }
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="due-date">Due Date</Label>
              {/* Date */}

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2 relative bottom-[1px]" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      if (date) {
                        const timeString = format(
                          dueDate || new Date(),
                          "HH:mm"
                        );
                        setDueDate(combineDateAndTime(date, timeString));
                      }
                    }}
                    initialFocus
                    disabled={{ before: startOfToday() }}
                  />
                </PopoverContent>
              </Popover>
              {/* Time */}
              <div
                tabIndex={-1}
                className={`border flex items-center px-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  errors.dueTime ? "border-destructive" : ""
                }`}
              >
                <Clock4Icon
                  className="h-4 w-4 mr-[4px] relative bottom-[0.5px] cursor-pointer"
                  onClick={() =>
                    dueTimeInputRef.current?.showPicker?.() ||
                    dueTimeInputRef.current?.focus()
                  }
                />
                <Input
                  type="time"
                  ref={dueTimeInputRef}
                  className={`w-[85px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent `}
                  value={dueDate ? format(dueDate, "HH:mm") : ""}
                  onChange={(e) => {
                    handleDueTimeChange(e);
                  }}
                />
              </div>
              <div className="relative">
                {errors.dueTime && (
                  <p className="absolute -bottom-2 text-xs text-destructive">
                    {errors.dueTime}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label htmlFor="reminder">Reminder</Label>
                <div className="flex items-center gap-2 self-start">
                  <input
                    type="checkbox"
                    id="enable-reminder"
                    checked={reminderEnabled}
                    onChange={(e) => {
                      handleToggleReminder(e);
                    }}
                  />
                  <Label htmlFor="enable-reminder">Enable Reminder</Label>
                </div>
              </div>
              {reminderEnabled && (
                <>
                  {/* Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !reminder && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 relative bottom-[1px]" />
                        {reminder ? format(reminder, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={reminder ? reminder : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const timeString = format(
                              reminder || new Date(),
                              "HH:mm"
                            );
                            setReminder(combineDateAndTime(date, timeString));
                          }
                        }}
                        initialFocus
                        disabled={{
                          before: startOfToday(),
                          after: dueDate ?? undefined,
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {/* Time */}
                  <div
                    tabIndex={-1}
                    className={`border flex items-center px-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      errors.remindTime ? "border-destructive" : ""
                    }`}
                  >
                    <Clock4Icon
                      className="h-4 w-4 mr-[4px] relative bottom-[0.5px] cursor-pointer"
                      onClick={() =>
                        reminderTimeInputRef.current?.showPicker?.() ||
                        reminderTimeInputRef.current?.focus()
                      }
                    />
                    <Input
                      type="time"
                      ref={reminderTimeInputRef}
                      className="w-[85px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                      value={reminder ? format(reminder, "HH:mm") : "00:00"}
                      onChange={(e) => {
                        handleRemindTimeChange(e);
                      }}
                    />
                  </div>
                  <div className="relative">
                    {errors.remindTime && (
                      <p className="absolute -bottom-2 text-xs text-destructive">
                        {errors.remindTime}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="recurrence">Recurrence</Label>
              <Select
                value={recurrence || ""}
                onValueChange={(value) =>
                  setRecurrence(value !== "not_recurring" ? value : null)
                }
              >
                <SelectTrigger id="recurrence">
                  <SelectValue placeholder="Not recurring" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_recurring">Not recurring</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {labels.map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {label}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleRemoveLabel(label)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Add a label"
                onKeyDown={handleKeyDown}
              />
              <Button type="button" size="icon" onClick={handleAddLabel}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{task ? "Update" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
