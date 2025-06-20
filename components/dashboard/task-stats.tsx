"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskStore } from "@/lib/stores/task-store";
import { CheckCircle, Clock, AlertTriangle, CalendarClock } from "lucide-react";

export function TaskStats() {
  const { tasks } = useTaskStore();
  const [stats, setStats] = useState({
    total: 0,
    completedThisWeek: 0,
    overdue: 0,
    dueSoon: 0,
  });

  useEffect(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const currentTime = new Date(now);
    // currentTime.setHours(23, 59, 59, 999);

    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);

    if (tasks.length !== 0) {
      setStats({
        total: tasks.length,
        completedThisWeek: tasks.filter(
          (task) =>
            task.completed &&
            task.completedAt &&
            new Date(task.completedAt) >= startOfWeek
        ).length,
        overdue: tasks.filter(
          (task) =>
            !task.completed &&
            task.dueDate &&
            new Date(task.dueDate) < currentTime
        ).length,
        dueSoon: tasks.filter(
          (task) =>
            !task.completed &&
            task.dueDate &&
            new Date(task.dueDate) > currentTime &&
            new Date(task.dueDate) <= threeDaysFromNow
        ).length,
      });
    }
  }, [tasks]);

  const stats_data = [
    {
      title: "Total Tasks",
      value: stats.total,
      icon: CheckCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Completed This Week",
      value: stats.completedThisWeek,
      icon: Clock,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-100 dark:bg-red-900",
    },
    {
      title: "Due Soon",
      value: stats.dueSoon,
      icon: CalendarClock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
  ];

  return (
    <>
      {stats_data.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`${stat.bgColor} rounded-full p-2`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
