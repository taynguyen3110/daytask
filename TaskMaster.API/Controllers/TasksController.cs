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
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TasksController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
        {
            var tasks = await _taskService.GetAllTasksAsync();
            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskItem>> GetTask(Guid id)
        {
            var task = await _taskService.GetTaskByIdAsync(id);
            
            if (task == null)
            {
                return NotFound();
            }
            
            return Ok(task);
        }

        [HttpPost]
        public async Task<ActionResult<TaskItem>> CreateTask(CreateTaskDto taskDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var task = await _taskService.CreateTaskAsync(taskDto);
            
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(Guid id, UpdateTaskDto taskDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var task = await _taskService.GetTaskByIdAsync(id);
            
            if (task == null)
            {
                return NotFound();
            }
            
            await _taskService.UpdateTaskAsync(id, taskDto);
            
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var task = await _taskService.GetTaskByIdAsync(id);
            
            if (task == null)
            {
                return NotFound();
            }
            
            await _taskService.DeleteTaskAsync(id);
            
            return NoContent();
        }

        [HttpGet("overdue")]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetOverdueTasks()
        {
            var tasks = await _taskService.GetOverdueTasksAsync();
            return Ok(tasks);
        }

        [HttpGet("upcoming")]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetUpcomingTasks()
        {
            var tasks = await _taskService.GetUpcomingTasksAsync();
            return Ok(tasks);
        }

        [HttpGet("completed")]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetCompletedTasks()
        {
            var tasks = await _taskService.GetCompletedTasksAsync();
            return Ok(tasks);
        }

        [HttpPost("{id}/snooze")]
        public async Task<IActionResult> SnoozeTask(Guid id, [FromBody] SnoozeTaskDto snoozeDto)
        {
            var task = await _taskService.GetTaskByIdAsync(id);
            
            if (task == null)
            {
                return NotFound();
            }
            
            await _taskService.SnoozeTaskAsync(id, snoozeDto.SnoozedUntil);
            
            return NoContent();
        }
    }
}
