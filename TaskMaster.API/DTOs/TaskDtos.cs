using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskMaster.API.Models;

namespace TaskMaster.API.DTOs
{
    public class CreateTaskDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        [StringLength(1000)]
        public string Description { get; set; }
        
        public DateTime? DueDate { get; set; }
        
        public PriorityLevel Priority { get; set; } = PriorityLevel.Medium;
        
        public List<string> Labels { get; set; } = new List<string>();
        
        public RecurrenceType? Recurrence { get; set; }
        
        public DateTime? Reminder { get; set; }
    }

    public class UpdateTaskDto
    {
        [StringLength(200)]
        public string Title { get; set; }
        
        [StringLength(1000)]
        public string Description { get; set; }
        
        public bool? Completed { get; set; }
        
        public DateTime? DueDate { get; set; }
        
        public PriorityLevel? Priority { get; set; }
        
        public List<string> Labels { get; set; }
        
        public RecurrenceType? Recurrence { get; set; }
        
        public DateTime? Reminder { get; set; }
        
        public DateTime? SnoozedUntil { get; set; }
        
        public DateTime? CompletedAt { get; set; }
    }

    public class SnoozeTaskDto
    {
        [Required]
        public DateTime SnoozedUntil { get; set; }
    }
}
