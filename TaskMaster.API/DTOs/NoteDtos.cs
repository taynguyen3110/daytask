using System;
using System.ComponentModel.DataAnnotations;

namespace TaskMaster.API.DTOs
{
    public class CreateNoteDto
    {
        [Required]
        [StringLength(5000)]
        public string Content { get; set; }
    }

    public class UpdateNoteDto
    {
        [Required]
        [StringLength(5000)]
        public string Content { get; set; }
    }
}
