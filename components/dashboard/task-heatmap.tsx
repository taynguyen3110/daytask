"use client";

import { useState, useEffect } from "react";
import { useTaskStore } from "@/lib/stores/task-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TaskHeatmap() {
  const { tasks } = useTaskStore();
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});

  useEffect(() => {
    // Generate data for the last 6 months
    const data: Record<string, number> = {};
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    // Initialize all dates with 0
    for (
      let d = new Date(sixMonthsAgo);
      d <= today;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];
      data[dateStr] = 0;
    }

    // Count completed tasks by date
    if (tasks.length !== 0) {
      tasks.forEach((task) => {
        if (task.completed && task.completedAt) {
          const dateStr = new Date(task.completedAt)
            .toISOString()
            .split("T")[0];
          if (data[dateStr] !== undefined) {
            data[dateStr] += 1;
          }
        }
      });
    }
    setHeatmapData(data);
  }, [tasks]);

  // Generate weeks and days for the heatmap
  const weeks: string[][] = [];
  const dates = Object.keys(heatmapData).sort();

  if (dates.length > 0) {
    let currentWeek: string[] = [];
    const currentDate = new Date(dates[0]);

    // Fill in the first week with empty cells for days before the start date
    const dayOfWeek = currentDate.getDay();
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push("");
    }

    // Fill in all dates
    dates.forEach((date) => {
      const d = new Date(date);

      // If we're on a new week, start a new array
      if (d.getDay() === 0 && currentWeek.length > 0) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }

      currentWeek.push(date);

      // If we're on the last date, push the remaining week
      if (date === dates[dates.length - 1]) {
        // Fill in the rest of the week with empty cells
        const remainingDays = 6 - d.getDay();
        for (let i = 0; i < remainingDays; i++) {
          currentWeek.push("");
        }
        weeks.push([...currentWeek]);
      }
    });
  }

  // Function to determine the intensity level based on the count
  const getIntensityLevel = (count: number) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    if (count === 4) return 4;
    return 5;
  };

  // Function to format date for tooltip
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUniqueMonths = (week: string[], weekIndex: number) => {
    const firstDate = week.find((d) => d);
    const month = firstDate
      ? new Date(firstDate).toLocaleString("en-US", {
          month: "short",
        })
      : "";

    const prevWeek = weeks[weekIndex - 1];
    const prevDate = prevWeek?.find((d) => d);
    const prevMonth = prevDate
      ? new Date(prevDate).toLocaleString("en-US", { month: "short" })
      : "";
    return month !== prevMonth ? month : "\u00A0";
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="flex">
          <div className="flex text-xs text-muted-foreground">
            <div className="flex flex-col flex-1 justify-between text-right mr-1">
              <div>&nbsp;</div>
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
          </div>

          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => {
              return (
                <div key={weekIndex} className="flex flex-col">
                  <div
                    key={weekIndex}
                    className="w-5 text-xs text-muted-foreground"
                  >
                    {getUniqueMonths(week, weekIndex)}
                  </div>
                  <div className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <TooltipProvider key={dayIndex}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`heatmap-cell flex-1 aspect-square ${
                                day
                                  ? `heatmap-level-${getIntensityLevel(
                                      heatmapData[day]
                                    )}`
                                  : "opacity-0"
                              }`}
                            />
                          </TooltipTrigger>
                          {day && (
                            <TooltipContent>
                              <div className="text-xs">
                                <div>{formatDate(day)}</div>
                                <div>{heatmapData[day]} tasks completed</div>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <div className="text-xs text-muted-foreground">Less</div>
          {[0, 1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`heatmap-cell h-3 w-3 heatmap-level-${level}`}
            />
          ))}
          <div className="text-xs text-muted-foreground">More</div>
        </div>
      </div>
    </div>
  );
}
