"use client";

import { useEffect } from "react";
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

export function Dashboard() {
  const { tasks } = useTaskStore();
  const { showConfetti, ConfettiComponent } = useConfetti();

  // Check if all tasks are completed
  useEffect(() => {
    if (tasks.length > 0 && tasks.every((task) => task.completed)) {
      showConfetti();
    }
  }, [tasks, showConfetti]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
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
