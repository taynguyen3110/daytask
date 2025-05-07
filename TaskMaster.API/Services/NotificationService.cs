using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TaskMaster.API.Data;
using TaskMaster.API.Models;

namespace TaskMaster.API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            ApplicationDbContext context,
            IHttpClientFactory httpClientFactory,
            ILogger<NotificationService> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<IEnumerable<Notification>> GetAllNotificationsAsync()
        {
            return await _context.Notifications
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Notification>> GetUnreadNotificationsAsync()
        {
            return await _context.Notifications
                .Where(n => !n.Read)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<Notification> GetNotificationByIdAsync(Guid id)
        {
            return await _context.Notifications.FindAsync(id);
        }

        public async Task<Notification> CreateNotificationAsync(string title, string message, Guid? taskId = null)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                Title = title,
                Message = message,
                Read = false,
                CreatedAt = DateTime.UtcNow,
                TaskId = taskId
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Check if Telegram notifications are enabled
            var settings = await _context.UserSettings.FirstOrDefaultAsync();
            if (settings != null && settings.EnableTelegramNotifications)
            {
                await SendTelegramNotificationAsync($"{title}\n\n{message}");
            }

            return notification;
        }

        public async Task<Notification> ScheduleNotificationAsync(string title, string message, DateTime scheduledFor, Guid? taskId = null)
        {
            // In a real application, this would use a background job scheduler like Hangfire
            // For this demo, we'll create a notification that will be displayed when the scheduled time comes
            
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                Title = title,
                Message = message
