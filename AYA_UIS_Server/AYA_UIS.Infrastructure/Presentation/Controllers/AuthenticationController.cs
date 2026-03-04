using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using AYA_UIS.Application.Contracts;
using AYA_UIS.Application.Dtos.AuthDtos;

namespace AYA_UIS.Infrastructure.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("PolicyLimitRate")]
    public class AuthenticationController : ControllerBase
    {

        private readonly IServiceManager _serviceManager;

        public AuthenticationController(IServiceManager serviceManager)
        {
            _serviceManager = serviceManager;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto, [FromQuery] string role = "Student")
        {
            var result = await _serviceManager.AuthenticationService.RegisterAsync(dto, role);
            return Ok(result);
        }

        [HttpPost("register/student/{departmentId:int}")]
        public async Task<IActionResult> RegisterStudent(int departmentId, [FromBody] RegisterStudentDto dto)
        {
            var result = await _serviceManager.AuthenticationService.RegisterStudentAsync(departmentId, dto);
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await _serviceManager.AuthenticationService.LoginAsync(dto);
            return Ok(result);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto dto)
        {
            var result = await _serviceManager.AuthenticationService.RefreshTokenAsync(dto.RefreshToken);
            return Ok(result);
        }

        [Authorize]
        [HttpPost("revoke")]
        public async Task<IActionResult> Revoke([FromBody] RefreshTokenRequestDto dto)
        {
            await _serviceManager.AuthenticationService.RevokeTokenAsync(dto.RefreshToken);
            return Ok(new { message = "Token revoked successfully." });
        }

    }
}
