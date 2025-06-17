"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskHeatmap } from "@/components/dashboard/task-heatmap";
import { TaskStats } from "@/components/dashboard/task-stats";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { RecurringTasks } from "@/components/dashboard/recurring-tasks";
import { SnoozedTasks } from "@/components/dashboard/snoozed-tasks";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { useTaskStore } from "@/lib/stores/task-store";
import { useConfetti } from "@/lib/hooks/use-confetti";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/lib/hooks/use-notifications";

export function Dashboard() {
  const { tasks } = useTaskStore();
  const { showConfetti, ConfettiComponent } = useConfetti();
  const { notifications, markAsRead } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [isMounted, setIsMounted] = useState(false);

  // Check if all tasks are completed
  useEffect(() => {
    if (tasks.length > 0 && tasks.every((task) => task.completed)) {
      showConfetti();
    }
  }, [tasks, showConfetti]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="ml-auto hidden opacity-0 md:block md:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {isMounted && unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-72 w-[400px]">
              <div className="p-2 text-sm font-medium">Notifications</div>
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start p-3"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {notification.message}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <TaskStats />
      </div>

      <div className="flex flex-col md:grid gap-6 md:grid-cols-2 lg:grid-cols-6">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>
              Your task completion over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskHeatmap />
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <MiniCalendar />
        </div>
        <div className="lg:col-span-3">
          <RecurringTasks />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <SnoozedTasks />
        </div>
      </div>

      <div>
        <UpcomingTasks />
      </div>
      {ConfettiComponent}
    </div>
  );
}
