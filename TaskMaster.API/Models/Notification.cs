using System;
using System.ComponentModel.DataAnnotations;

namespace TaskMaster.API.Models
{
    public class Notification
    {
        public Guid Id { get; set; }
        
        [Required]
        public string Title { get; set; }
        
        [Required]
        public string Message { get; set; }
        
        public bool Read { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public Guid? TaskId { get; set; }
        
        public TaskItem Task { get; set; }
    }
}
