using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskMaster.API.Data;
using TaskMaster.API.DTOs;
using TaskMaster.API.Models;

namespace TaskMaster.API.Services
{
    public class NoteService : INoteService
    {
        private readonly ApplicationDbContext _context;

        public NoteService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Note>> GetAllNotesAsync()
        {
            return await _context.Notes.ToListAsync();
        }

        public async Task<Note> GetNoteByIdAsync(Guid id)
        {
            return await _context.Notes.FindAsync(id);
        }

        public async Task<Note> CreateNoteAsync(CreateNoteDto noteDto)
        {
            var note = new Note
            {
                Id = Guid.NewGuid(),
                Content = noteDto.Content,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Notes.Add(note);
            await _context.SaveChangesAsync();

            return note;
        }

        public async Task<Note> UpdateNoteAsync(Guid id, UpdateNoteDto noteDto)
        {
            var note = await _context.Notes.FindAsync(id);

            if (note == null)
            {
                return null;
            }

            note.Content = noteDto.Content;
            note.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return note;
        }

        public async Task DeleteNoteAsync(Guid id)
        {
            var note = await _context.Notes.FindAsync(id);

            if (note != null)
            {
                _context.Notes.Remove(note);
                await _context.SaveChangesAsync();
            }
        }
    }
}
