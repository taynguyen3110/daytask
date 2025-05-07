using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskMaster.API.Data;
using TaskMaster.API.DTOs;
using TaskMaster.API.Models;

namespace TaskMaster.API.Services
{
    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public TaskService(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<IEnumerable<TaskItem>> GetAllTasksAsync()
        {
            return await _context.Tasks.ToListAsync();
        }

        public async Task<TaskItem> GetTaskByIdAsync(Guid id)
        {
            return await _context.Tasks.FindAsync(id);
        }

        public async Task<TaskItem> CreateTaskAsync(CreateTaskDto taskDto)
        {
            var task = new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = taskDto.Title,
                Description = taskDto.Description,
                Completed = false,
                DueDate = taskDto.DueDate,
                Priority = taskDto.Priority,
                Labels = taskDto.Labels,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Recurrence = taskDto.Recurrence,
                Reminder = taskDto.Reminder
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            // If a reminder is set, create a notification for it
            if (task.Reminder.HasValue)
            {
                await ScheduleReminderAsync(task);
            }

            return task;
        }

        public async Task<TaskItem> UpdateTaskAsync(Guid id, UpdateTaskDto taskDto)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
            {
                return null;
            }

            // Update task properties if provided
            if (taskDto.Title != null)
            {
                task.Title = taskDto.Title;
            }

            if (taskDto.Description != null)
            {
                task.Description = taskDto.Description;
            }

            if (taskDto.Completed.HasValue)
            {
                bool wasCompleted = task.Completed;
                task.Completed = taskDto.Completed.Value;

                // If task is being marked as completed now
                if (!wasCompleted && task.Completed)
                {
                    task.CompletedAt = DateTime.UtcNow;
                    
                    // If task is recurring, create the next occurrence
                    if (task.Recurrence.HasValue)
                    {
                        await CreateNextRecurringTaskAsync(task);
                    }
                }
                else if (wasCompleted && !task.Completed)
                {
                    // If task is being unmarked as completed
                    task.CompletedAt = null;
                }
            }

            if (taskDto.DueDate.HasValue)
            {
                task.DueDate = taskDto.DueDate;
            }

            if (taskDto.Priority.HasValue)
            {
                task.Priority = taskDto.Priority.Value;
            }

            if (taskDto.Labels != null)
            {
                task.Labels = taskDto.Labels;
            }

            if (taskDto.Recurrence.HasValue)
            {
                task.Recurrence = taskDto.Recurrence;
            }

            // Handle reminder changes
            bool reminderChanged = false;
            if (taskDto.Reminder.HasValue)
            {
                reminderChanged = !task.Reminder.HasValue || task.Reminder.Value != taskDto.Reminder.Value;
                task.Reminder = taskDto.Reminder;
            }

            if (taskDto.SnoozedUntil.HasValue)
            {
                task.SnoozedUntil = taskDto.SnoozedUntil;
            }

            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // If reminder was changed, update the scheduled notification
            if (reminderChanged && task.Reminder.HasValue)
            {
                await ScheduleReminderAsync(task);
            }

            return task;
        }

        public async Task DeleteTaskAsync(Guid id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task != null)
            {
                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<TaskItem>> GetOverdueTasksAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.Tasks
                .Where(t => !t.Completed && t.DueDate.HasValue && t.DueDate &lt; now)
                .ToListAsync();
        }

        public async Task<IEnumerable<TaskItem>> GetUpcomingTasksAsync()
        {
            var now = DateTime.UtcNow;
            var oneWeekFromNow = now.AddDays(7);
            return await _context.Tasks
                .Where(t => !t.Completed && t.DueDate.HasValue && t.DueDate >= now && t.DueDate &lt;= oneWeekFromNow)
                .ToListAsync();
        }

        public async Task<IEnumerable<TaskItem>> GetCompletedTasksAsync()
        {
            return await _context.Tasks
                .Where(t => t.Completed)
                .ToListAsync();
        }

        public async Task<TaskItem> SnoozeTaskAsync(Guid id, DateTime snoozedUntil)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
            {
                return null;
            }

            task.SnoozedUntil = snoozedUntil;
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return task;
        }

        private async Task ScheduleReminderAsync(TaskItem task)
        {
            if (!task.Reminder.HasValue)
            {
                return;
            }

            // In a real application, this would schedule a notification to be sent at the reminder time
            // For this demo, we'll create a notification that will be displayed when the reminder time comes
            
            // First, remove any existing reminders for this task
            var existingNotifications = await _context.Notifications
                .Where(n => n.TaskId == task.Id)
                .ToListAsync();
                
            if (existingNotifications.Any())
            {
                _context.Notifications.RemoveRange(existingNotifications);
                await _context.SaveChangesAsync();
            }
            
            // Only schedule if the reminder is in the future
            if (task.Reminder.Value > DateTime.UtcNow)
            {
                await _notificationService.ScheduleNotificationAsync(
                    $"Task Reminder: {task.Title}",
                    $"Your task '{task.Title}' is due {(task.DueDate.HasValue ? $"on {task.DueDate.Value.ToString("g")}" : "soon")}.",
                    task.Reminder.Value,
                    task.Id
                );
            }
        }

        private async Task CreateNextRecurringTaskAsync(TaskItem completedTask)
        {
            if (!completedTask.Recurrence.HasValue || !completedTask.DueDate.HasValue)
            {
                return;
            }

            DateTime nextDueDate;
            
            switch (completedTask.Recurrence.Value)
            {
                case RecurrenceType.Daily:
                    nextDueDate = completedTask.DueDate.Value.AddDays(1);
                    break;
                case RecurrenceType.Weekly:
                    nextDueDate = completedTask.DueDate.Value.AddDays(7);
                    break;
                case RecurrenceType.Monthly:
                    nextDueDate = completedTask.DueDate.Value.AddMonths(1);
                    break;
                default:
                    return;
            }

            // Calculate the next reminder based on the same offset from the due date
            DateTime? nextReminder = null;
            if (completedTask.Reminder.HasValue && completedTask.DueDate.HasValue)
            {
                var reminderOffset = completedTask.DueDate.Value - completedTask.Reminder.Value;
                nextReminder = nextDueDate - reminderOffset;
            }

            var newTask = new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = completedTask.Title,
                Description = completedTask.Description,
                Completed = false,
                DueDate = nextDueDate,
                Priority = completedTask.Priority,
                Labels = completedTask.Labels,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Recurrence = completedTask.Recurrence,
                Reminder = nextReminder
            };

            _context.Tasks.Add(newTask);
            await _context.SaveChangesAsync();

            // Schedule reminder for the new task if needed
            if (newTask.Reminder.HasValue)
            {
                await ScheduleReminderAsync(newTask);
            }
        }
    }
}
