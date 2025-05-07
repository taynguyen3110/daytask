using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TaskMaster.API.Data;
using TaskMaster.API.DTOs;
using TaskMaster.API.Models;

namespace TaskMaster.API.Services
{
    public class SettingsService : ISettingsService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public SettingsService(ApplicationDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<UserSettings> GetUserSettingsAsync()
        {
            // For simplicity, we're assuming a single user system
            // In a real app, this would be tied to the authenticated user
            var settings = await _context.UserSettings.FirstOrDefaultAsync();

            if (settings == null)
            {
                // Create default settings if none exist
                settings = new UserSettings
                {
                    Id = Guid.NewGuid(),
                    Theme = "system",
                    EnableOfflineMode = true,
                    EnableBrowserNotifications = false,
                    EnableTelegramNotifications = false,
                    AutoSuggestDueDates = true,
                    ShowConfetti = true
                };

                _context.UserSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return settings;
        }

        public async Task<UserSettings> UpdateUserSettingsAsync(UpdateSettingsDto settingsDto)
        {
            var settings = await GetUserSettingsAsync();

            // Update only the properties that are provided
            if (settingsDto.Theme != null)
            {
                settings.Theme = settingsDto.Theme;
            }

            if (settingsDto.EnableOfflineMode.HasValue)
            {
                settings.EnableOfflineMode = settingsDto.EnableOfflineMode.Value;
            }

            if (settingsDto.EnableBrowserNotifications.HasValue)
            {
                settings.EnableBrowserNotifications = settingsDto.EnableBrowserNotifications.Value;
            }

            if (settingsDto.EnableTelegramNotifications.HasValue)
            {
                settings.EnableTelegramNotifications = settingsDto.EnableTelegramNotifications.Value;
            }

            if (settingsDto.TelegramToken != null)
            {
                settings.TelegramToken = settingsDto.TelegramToken;
            }

            if (settingsDto.TelegramChatId != null)
            {
                settings.TelegramChatId = settingsDto.TelegramChatId;
            }

            if (settingsDto.AutoSuggestDueDates.HasValue)
            {
                settings.AutoSuggestDueDates = settingsDto.AutoSuggestDueDates.Value;
            }

            if (settingsDto.ShowConfetti.HasValue)
            {
                settings.ShowConfetti = settingsDto.ShowConfetti.Value;
            }

            await _context.SaveChangesAsync();
            return settings;
        }

        public async Task<(bool Success, string Message)> TestTelegramNotificationAsync()
        {
            var settings = await GetUserSettingsAsync();

            if (string.IsNullOrEmpty(settings.TelegramToken) || string.IsNullOrEmpty(settings.TelegramChatId))
            {
                return (false, "Telegram token or chat ID is not configured");
            }

            try
            {
                var client = _httpClientFactory.CreateClient();
                var message = new
                {
                    chat_id = settings.TelegramChatId,
                    text = "This is a test notification from TaskMaster!"
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(message),
                    Encoding.UTF8,
                    "application/json");

                var response = await client.PostAsync(
                    $"https://api.telegram.org/bot{settings.TelegramToken}/sendMessage",
                    content);

                if (response.IsSuccessStatusCode)
                {
                    return (true, "Test notification sent successfully");
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return (false, $"Failed to send test notification: {errorContent}");
                }
            }
            catch (Exception ex)
            {
                return (false, $"Error sending test notification: {ex.Message}");
            }
        }
    }
}
