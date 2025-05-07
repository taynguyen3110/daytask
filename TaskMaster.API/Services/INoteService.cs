using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskMaster.API.DTOs;
using TaskMaster.API.Models;

namespace TaskMaster.API.Services
{
    public interface INoteService
    {
        Task<IEnumerable<Note>> GetAllNotesAsync();
        Task<Note> GetNoteByIdAsync(Guid id);
        Task<Note> CreateNoteAsync(CreateNoteDto noteDto);
        Task<Note> UpdateNoteAsync(Guid id, UpdateNoteDto noteDto);
        Task DeleteNoteAsync(Guid id);
    }
}
