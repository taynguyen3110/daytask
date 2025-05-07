using System;

namespace TaskMaster.API.Models
{
    public class UserSettings
    {
        public Guid Id { get; set; }
        
        public string Theme { get; set; } = "system";
        
        public bool EnableOfflineMode { get; set; } = true;
        
        public bool EnableBrowserNotifications { get; set; } = false;
        
        public bool EnableTelegramNotifications { get; set; } = false;
        
        public string TelegramToken { get; set; }
        
        public string TelegramChatId { get; set; }
        
        public bool AutoSuggestDueDates { get; set; } = true;
        
        public bool ShowConfetti { get; set; } = true;
    }
}
