using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
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

        // ── No auth required ───────────────────────────────────────────────────

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            // Always 200 — never reveal whether email exists
            await _serviceManager.AuthenticationService.ForgotPasswordAsync(dto.Email);
            return Ok(new { message = "Check your email for the reset link." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            if (dto.NewPassword != dto.ConfirmPassword)
                return BadRequest(new { message = "Passwords do not match." });

            var result = await _serviceManager.AuthenticationService
                .ResetPasswordAsync(dto.Email, dto.Token, dto.NewPassword);

            return Ok(new { message = result });
        }

        // ── Requires valid access token ────────────────────────────────────────

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            // Get email from JWT claims — no need to pass it in the request body
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email))
                return Unauthorized(new { message = "Invalid token." });

            var result = await _serviceManager.AuthenticationService
                .ChangePasswordAsync(email, dto.CurrentPassword, dto.NewPassword);

            return Ok(new { message = result });
        }
    }
}