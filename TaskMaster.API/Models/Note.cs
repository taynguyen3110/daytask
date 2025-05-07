using System;
using System.ComponentModel.DataAnnotations;

namespace TaskMaster.API.Models
{
    public class Note
    {
        public Guid Id { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }
    }
}
