"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useTaskStore } from "@/lib/stores/task-store"
import type { Task } from "@/lib/types"
import { addDays, addHours, format, startOfTomorrow } from "date-fns"

interface SnoozeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
}

export function SnoozeDialog({ open, onOpenChange, task }: SnoozeDialogProps) {
  const { updateTask } = useTaskStore()
  const [snoozeOption, setSnoozeOption] = useState<string>("tomorrow")
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined)

  const handleSnooze = () => {
    let snoozeDate: Date

    switch (snoozeOption) {
      case "later_today":
        snoozeDate = addHours(new Date(), 3)
        break
      case "tomorrow":
        snoozeDate = startOfTomorrow()
        break
      case "weekend":
        const today = new Date()
        const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday
        const daysUntilSaturday = dayOfWeek === 6 ? 7 : 6 - dayOfWeek
        snoozeDate = addDays(today, daysUntilSaturday)
        break
      case "next_week":
        snoozeDate = addDays(new Date(), 7)
        break
      case "custom":
        if (!customDate) return
        snoozeDate = customDate
        break
      default:
        snoozeDate = startOfTomorrow()
    }

    updateTask({
      ...task,
      snoozedUntil: snoozeDate.toISOString(),
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Snooze Task</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={snoozeOption} onValueChange={setSnoozeOption}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="later_today" id="later_today" />
              <Label htmlFor="later_today">Later Today (3 hours)</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="tomorrow" id="tomorrow" />
              <Label htmlFor="tomorrow">Tomorrow</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="weekend" id="weekend" />
              <Label htmlFor="weekend">This Weekend</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="next_week" id="next_week" />
              <Label htmlFor="next_week">Next Week</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom Date</Label>
            </div>
          </RadioGroup>

          {snoozeOption === "custom" && (
            <div className="mt-4">
              <Calendar
                mode="single"
                selected={customDate}
                onSelect={setCustomDate}
                initialFocus
                disabled={(date) => date < new Date()}
              />
              {customDate && (
                <div className="mt-2 text-sm text-muted-foreground">Selected date: {format(customDate, "PPP")}</div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSnooze}>Snooze</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
