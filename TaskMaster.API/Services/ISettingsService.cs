using System.Threading.Tasks;
using TaskMaster.API.DTOs;
using TaskMaster.API.Models;

namespace TaskMaster.API.Services
{
    public interface ISettingsService
    {
        Task<UserSettings> GetUserSettingsAsync();
        Task<UserSettings> UpdateUserSettingsAsync(UpdateSettingsDto settingsDto);
        Task<(bool Success, string Message)> TestTelegramNotificationAsync();
    }
}
