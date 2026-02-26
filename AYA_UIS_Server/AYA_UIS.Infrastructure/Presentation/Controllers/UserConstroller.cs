using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using AYA_UIS.Application.Dtos.UserDtos;
using AYA_UIS.Domain.Queries;

namespace AYA_UIS.Infrastructure.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("PolicyLimitRate")]
    public class UserController : ControllerBase
    {
        private readonly IServiceManager _serviceManager;

        public UserController(IServiceManager serviceManager)
        {
            _serviceManager = serviceManager;
        }

        [HttpGet("{academicCode}/academic")]
        public async Task<IActionResult> GetAcademicInfo(string academicCode)
        {
            var userProfile = await _serviceManager.UserService.GetUserProfileByAcademicCodeAsync(academicCode);
            return Ok(userProfile);
        }

        [HttpPatch("update-profile-picture")]
        public async Task<IActionResult> UpdateProfilePicture([FromForm] UpdateProfilePictureDto updateProfilePictureDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            
            await _serviceManager.UserService.UpdateProfilePictureAsync(userId, updateProfilePictureDto);
            return NoContent();
        }

        [HttpPatch("update-student-specialization")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStudentSpecialization([FromBody] UpdateStudentSpecializationDto updateStudentSpecializationDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            
            await _serviceManager.UserService.UpdateStudentSpecializationAsync(userId, updateStudentSpecializationDto);
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery]UserQueries queries)
        {
            await _serviceManager.UserService.GetAllUsers(queries);
            return NoContent();
        }

    }
}