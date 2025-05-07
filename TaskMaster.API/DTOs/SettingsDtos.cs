using System.ComponentModel.DataAnnotations;

namespace TaskMaster.API.DTOs
{
    public class UpdateSettingsDto
    {
        public string Theme { get; set; }
        
        public bool? EnableOfflineMode { get; set; }
        
        public bool? EnableBrowserNotifications { get; set; }
        
        public bool? EnableTelegramNotifications { get; set; }
        
        [StringLength(100)]
        public string TelegramToken { get; set; }
        
        [StringLength(100)]
        public string TelegramChatId { get; set; }
        
        public bool? AutoSuggestDueDates { get; set; }
        
        public bool? ShowConfetti { get; set; }
    }
}
