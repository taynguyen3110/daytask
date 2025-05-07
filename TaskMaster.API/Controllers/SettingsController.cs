using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using TaskMaster.API.Models;
using TaskMaster.API.Services;
using TaskMaster.API.DTOs;

namespace TaskMaster.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly ISettingsService _settingsService;

        public SettingsController(ISettingsService settingsService)
        {
            _settingsService = settingsService;
        }

        [HttpGet]
        public async Task<ActionResult<UserSettings>> GetSettings()
        {
            var settings = await _settingsService.GetUserSettingsAsync();
            return Ok(settings);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateSettings(UpdateSettingsDto settingsDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            await _settingsService.UpdateUserSettingsAsync(settingsDto);
            
            return NoContent();
        }

        [HttpPost("telegram/test")]
        public async Task<IActionResult> TestTelegramNotification()
        {
            var result = await _settingsService.TestTelegramNotificationAsync();
            
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }
            
            return Ok(new { message = "Test notification sent successfully" });
        }
    }
}
