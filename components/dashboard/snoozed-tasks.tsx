"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskStore } from "@/lib/stores/task-store";
import type { Task } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { getPriorityBadge } from "./upcoming-tasks";
import { Badge } from "../ui/badge";
import { Tag } from "lucide-react";

export function SnoozedTasks() {
  const { tasks } = useTaskStore();
  const [snoozedTasks, setSnoozedTasks] = useState<Task[]>([]);

  useEffect(() => {
    const filtered = tasks
      .filter(
        (task) => task.snoozedUntil && new Date(task.snoozedUntil) > new Date()
      )
      .sort(
        (a, b) =>
          new Date(a.snoozedUntil!).getTime() -
          new Date(b.snoozedUntil!).getTime()
      )
      .slice(0, 5);

    setSnoozedTasks(filtered);
  }, [tasks]);

  return (
    <Card className="lg:h-[370px] max-h-[370px] overflow-y-auto">
      <CardHeader>
        <CardTitle>Snoozed Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {snoozedTasks.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            No snoozed tasks
          </div>
        ) : (
          <div className="space-y-4">
            {snoozedTasks.map((task) => (
              <div key={task.id} className="space-y-1">
                <div className="flex items-center justify-between flex-wrap">
                  <div className="font-medium">
                    {task.title}
                  </div>
                  <div className="flex gap-2">
                    {getPriorityBadge(task.priority!)}
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
                <div className="text-xs text-muted-foreground">
                  Snoozed until{" "}
                  {formatDistanceToNow(new Date(task.snoozedUntil!), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
