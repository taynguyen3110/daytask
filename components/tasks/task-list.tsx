"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Plus, Filter, SortAsc, SortDesc, Calendar, Tag, AlertTriangle, CheckCircle2, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TaskItem } from "@/components/tasks/task-item"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { useTaskStore } from "@/lib/stores/task-store"
import type { Task } from "@/lib/types"
import { format, isToday, isTomorrow, isYesterday, isThisWeek, addDays } from "date-fns"

export function TaskList() {
  const searchParams = useSearchParams()
  const { tasks, fetchTasks } = useTaskStore()
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("today")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "title">("dueDate")
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [filterLabel, setFilterLabel] = useState<string | null>(null)

  // Get unique labels from all tasks
  const allLabels = tasks.length > 0 ? Array.from(new Set(tasks.flatMap((task) => task.labels || []))) : [];

  // Handle date from URL query params
  useEffect(() => {
    const dateParam = searchParams.get("date")
    if (dateParam) {
      setActiveTab("date")
    }
  }, [searchParams])

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Filter and sort tasks
  useEffect(() => {
    let filtered = [...tasks]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)),
      )
    }

    // Apply tab filter
    if (activeTab === "today") {
      filtered = filtered.filter((task) => task.dueDate && isToday(new Date(task.dueDate)))
    } else if (activeTab === "upcoming") {
      const today = new Date()
      const nextWeek = addDays(today, 7)
      filtered = filtered.filter(
        (task) => task.dueDate && new Date(task.dueDate) > today && new Date(task.dueDate) <= nextWeek,
      )
    } else if (activeTab === "completed") {
      filtered = filtered.filter((task) => task.completed)
    } else if (activeTab === "overdue") {
      const today = new Date()
      filtered = filtered.filter((task) => !task.completed && task.dueDate && new Date(task.dueDate) < today)
    } else if (activeTab === "date") {
      const dateParam = searchParams.get("date")
      if (dateParam) {
        const selectedDate = new Date(dateParam)
        filtered = filtered.filter((task) => {
          if (!task.dueDate) return false
          const taskDate = new Date(task.dueDate)
          return (
            taskDate.getFullYear() === selectedDate.getFullYear() &&
            taskDate.getMonth() === selectedDate.getMonth() &&
            taskDate.getDate() === selectedDate.getDate()
          )
        })
      }
    }

    // Apply priority filter
    if (filterPriority) {
      filtered = filtered.filter((task) => task.priority === filterPriority)
    }

    // Apply label filter
    if (filterLabel) {
      filtered = filtered.filter((task) => task.labels && task.labels.includes(filterLabel))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return sortOrder === "asc" ? 1 : -1
        if (!b.dueDate) return sortOrder === "asc" ? -1 : 1
        return sortOrder === "asc"
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      } else if (sortBy === "priority") {
        const priorityValues = { high: 3, medium: 2, low: 1 }
        const aValue = a.priority ? priorityValues[a.priority as keyof typeof priorityValues] || 0 : 0
        const bValue = b.priority ? priorityValues[b.priority as keyof typeof priorityValues] || 0 : 0
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue
      } else {
        return sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      }
    })

    setFilteredTasks(filtered)
  }, [tasks, searchQuery, activeTab, sortOrder, sortBy, filterPriority, filterLabel, searchParams])

  // Group tasks by due date
  const groupTasksByDate = () => {
    const groups: Record<string, Task[]> = {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
      noDate: [],
    }

    filteredTasks.forEach((task) => {
      if (!task.dueDate) {
        groups.noDate.push(task)
      } else {
        const dueDate = new Date(task.dueDate)
        const now = new Date()

        if (dueDate < now && !isToday(dueDate)) {
          groups.overdue.push(task)
        } else if (isToday(dueDate)) {
          groups.today.push(task)
        } else if (isTomorrow(dueDate)) {
          groups.tomorrow.push(task)
        } else if (isThisWeek(dueDate)) {
          groups.thisWeek.push(task)
        } else {
          groups.later.push(task)
        }
      }
    })

    return groups
  }

  const taskGroups = groupTasksByDate()

  // Format date for group headers
  const formatGroupDate = (date: Date) => {
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    if (isYesterday(date)) return "Yesterday"
    if (isThisWeek(date)) return `${format(date, "EEEE")}`
    return format(date, "MMM d, yyyy")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsTaskDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setFilterPriority(null)}>All Priorities</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("high")}>
                  <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                  High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("medium")}>
                  <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("low")}>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-blue-500" />
                  Low
                </DropdownMenuItem>
              </DropdownMenuGroup>

              {allLabels.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Label</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setFilterLabel(null)}>All Labels</DropdownMenuItem>
                    {allLabels.map((label) => (
                      <DropdownMenuItem key={label} onClick={() => setFilterLabel(label)}>
                        <Tag className="mr-2 h-4 w-4" />
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {sortOrder === "asc" ? <SortAsc className="mr-2 h-4 w-4" /> : <SortDesc className="mr-2 h-4 w-4" />}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSortBy("dueDate")} className={sortBy === "dueDate" ? "bg-muted" : ""}>
                <Calendar className="mr-2 h-4 w-4" />
                Due Date
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("priority")}
                className={sortBy === "priority" ? "bg-muted" : ""}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("title")} className={sortBy === "title" ? "bg-muted" : ""}>
                <Tag className="mr-2 h-4 w-4" />
                Title
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                {sortOrder === "asc" ? (
                  <>
                    <SortDesc className="mr-2 h-4 w-4" />
                    Descending
                  </>
                ) : (
                  <>
                    <SortAsc className="mr-2 h-4 w-4" />
                    Ascending
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active filters display */}
      {(filterPriority || filterLabel) && (
        <div className="flex flex-wrap gap-2">
          {filterPriority && (
            <Badge variant="outline" className="flex items-center gap-1">
              Priority: {filterPriority}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setFilterPriority(null)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filterLabel && (
            <Badge variant="outline" className="flex items-center gap-1">
              Label: {filterLabel}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setFilterLabel(null)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="text-muted-foreground mt-1">Create a new task to get started</p>
              <Button className="mt-4" onClick={() => setIsTaskDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          ) : (
            <>
              {taskGroups.overdue.length > 0 && (
                <div>
                  <h2 className="font-semibold text-destructive mb-2">Overdue</h2>
                  <div className="space-y-2">
                    {taskGroups.overdue.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              )}

              {taskGroups.today.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-2">Today</h2>
                  <div className="space-y-2">
                    {taskGroups.today.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              )}

              {taskGroups.tomorrow.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-2">Tomorrow</h2>
                  <div className="space-y-2">
                    {taskGroups.tomorrow.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              )}

              {taskGroups.thisWeek.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-2">This Week</h2>
                  <div className="space-y-2">
                    {taskGroups.thisWeek.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              )}

              {taskGroups.later.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-2">Later</h2>
                  <div className="space-y-2">
                    {taskGroups.later.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              )}

              {taskGroups.noDate.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-2">No Due Date</h2>
                  <div className="space-y-2">
                    {taskGroups.noDate.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="today" className="mt-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No tasks for today</h3>
              <p className="text-muted-foreground mt-1">Create a new task for today</p>
              <Button className="mt-4" onClick={() => setIsTaskDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No upcoming tasks</h3>
              <p className="text-muted-foreground mt-1">Plan ahead by creating tasks for the upcoming week</p>
              <Button className="mt-4" onClick={() => setIsTaskDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="mt-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No overdue tasks</h3>
              <p className="text-muted-foreground mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No completed tasks</h3>
              <p className="text-muted-foreground mt-1">Complete tasks to see them here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="date" className="mt-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No tasks for this date</h3>
              <p className="text-muted-foreground mt-1">Create a new task for this date</p>
              <Button className="mt-4" onClick={() => setIsTaskDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        defaultDate={searchParams.get("date") || undefined}
      />
    </div>
  )
}
