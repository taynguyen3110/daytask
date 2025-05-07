using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskMaster.API.Models;

namespace TaskMaster.API.Services
{
    public interface INotificationService
    {
        Task<IEnumerable<Notification>> GetAllNotificationsAsync();
        Task<IEnumerable<Notification>> GetUnreadNotificationsAsync();
        Task<Notification> GetNotificationByIdAsync(Guid id);
        Task<Notification> CreateNotificationAsync(string title, string message, Guid? taskId = null);
        Task<Notification> ScheduleNotificationAsync(string title, string message, DateTime scheduledFor, Guid? taskId = null);
        Task MarkAsReadAsync(Guid id);
        Task MarkAllAsReadAsync();
        Task DeleteNotificationAsync(Guid id);
        Task ClearAllNotificationsAsync();
        Task SendTelegramNotificationAsync(string message);
    }
}
