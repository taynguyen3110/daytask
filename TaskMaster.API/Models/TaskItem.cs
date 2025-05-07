using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskMaster.API.Models
{
    public class TaskItem
    {
        public Guid Id { get; set; }
        
        [Required]
        public string Title { get; set; }
        
        public string Description { get; set; }
        
        public bool Completed { get; set; }
        
        public DateTime? DueDate { get; set; }
        
        public PriorityLevel Priority { get; set; }
        
        public List<string> Labels { get; set; } = new List<string>();
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }
        
        public DateTime? CompletedAt { get; set; }
        
        public RecurrenceType? Recurrence { get; set; }
        
        public DateTime? Reminder { get; set; }
        
        public DateTime? SnoozedUntil { get; set; }
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum PriorityLevel
    {
        Low,
        Medium,
        High
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum RecurrenceType
    {
        Daily,
        Weekly,
        Monthly
    }
}
