using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskMaster.API.DTOs;
using TaskMaster.API.Models;

namespace TaskMaster.API.Services
{
    public interface ITaskService
    {
        Task<IEnumerable<TaskItem>> GetAllTasksAsync();
        Task<TaskItem> GetTaskByIdAsync(Guid id);
        Task<TaskItem> CreateTaskAsync(CreateTaskDto taskDto);
        Task<TaskItem> UpdateTaskAsync(Guid id, UpdateTaskDto taskDto);
        Task DeleteTaskAsync(Guid id);
        Task<IEnumerable<TaskItem>> GetOverdueTasksAsync();
        Task<IEnumerable<TaskItem>> GetUpcomingTasksAsync();
        Task<IEnumerable<TaskItem>> GetCompletedTasksAsync();
        Task<TaskItem> SnoozeTaskAsync(Guid id, DateTime snoozedUntil);
    }
}
