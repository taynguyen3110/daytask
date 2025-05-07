"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTaskStore } from "@/lib/stores/task-store"
import { useRouter } from "next/navigation"

export function MiniCalendar() {
  const router = useRouter()
  const { tasks } = useTaskStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<Array<{ date: Date | null; hasTask: boolean }>>([])

  // Get the current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get the first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)

  // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDayOfMonth.getDay()

  // Get the number of days in the month
  const daysInMonth = lastDayOfMonth.getDate()

  // Month names for the header
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Day names for the header
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  // Function to go to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  // Function to go to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Function to check if a date has tasks
  const dateHasTasks = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return tasks.some((task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate).toISOString().split("T")[0]
      return taskDate === dateString
    })
  }

  // Function to handle day click
  const handleDayClick = (date: Date | null) => {
    if (date) {
      router.push(`/tasks?date=${date.toISOString().split("T")[0]}`)
    }
  }

  // Generate calendar days
  useEffect(() => {
    const days: Array<{ date: Date | null; hasTask: boolean }> = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: null, hasTask: false })
    }

    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i)
      days.push({ date, hasTask: dateHasTasks(date) })
    }

    // Add empty cells to complete the last week if needed
    const remainingCells = 7 - (days.length % 7)
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push({ date: null, hasTask: false })
      }
    }

    setCalendarDays(days)
  }, [currentDate, tasks])

  // Check if a date is today
  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Calendar</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center font-medium mb-2">
          {monthNames[currentMonth]} {currentYear}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
          {dayNames.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-6 gap-1 text-center">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                calendar-day 
                ${day.date ? "cursor-pointer hover:bg-muted" : "opacity-0"} 
                ${isToday(day.date) ? "calendar-day-active" : ""} 
                ${day.hasTask ? "calendar-day-has-tasks" : ""}
              `}
              onClick={() => handleDayClick(day.date)}
            >
              {day.date?.getDate()}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
