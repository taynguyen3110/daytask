using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskMaster.API.Models;
using TaskMaster.API.Services;
using TaskMaster.API.DTOs;

namespace TaskMaster.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase

```csharp file="TaskMaster.API/Controllers/NotesController.cs" type="code"
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskMaster.API.Models;
using TaskMaster.API.Services;
using TaskMaster.API.DTOs;

namespace TaskMaster.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly INoteService _noteService;

        public NotesController(INoteService noteService)
        {
            _noteService = noteService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Note>>> GetNotes()
        {
            var notes = await _noteService.GetAllNotesAsync();
            return Ok(notes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Note>> GetNote(Guid id)
        {
            var note = await _noteService.GetNoteByIdAsync(id);
            
            if (note == null)
            {
                return NotFound();
            }
            
            return Ok(note);
        }

        [HttpPost]
        public async Task<ActionResult<Note>> CreateNote(CreateNoteDto noteDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var note = await _noteService.CreateNoteAsync(noteDto);
            
            return CreatedAtAction(nameof(GetNote), new { id = note.Id }, note);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(Guid id, UpdateNoteDto noteDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var note = await _noteService.GetNoteByIdAsync(id);
            
            if (note == null)
            {
                return NotFound();
            }
            
            await _noteService.UpdateNoteAsync(id, noteDto);
            
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(Guid id)
        {
            var note = await _noteService.GetNoteByIdAsync(id);
            
            if (note == null)
            {
                return NotFound();
            }
            
            await _noteService.DeleteNoteAsync(id);
            
            return NoContent();
        }
    }
}
