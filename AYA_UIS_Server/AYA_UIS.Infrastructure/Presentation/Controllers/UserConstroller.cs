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
using Shared.Respones;

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
            
             var profilePictureUrl = await _serviceManager.UserService.UpdateProfilePictureAsync(userId, updateProfilePictureDto);
            return Ok(new { ProfilePictureUrl = profilePictureUrl });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery]UserQueries queries)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            
            var users = await _serviceManager.UserService.GetAllUsers(userId, queries);
            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("paginated")]
        public async Task<IActionResult> GetAllPaginated([FromQuery] UserQueries queries)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var (users, totalCount) = await _serviceManager.UserService.GetAllUsersWithPaginationAsync(userId, queries);
            return Ok(PagedResponse<UserWithDepartmentDto>.SuccessResponse(users, queries.PageNumber, queries.PageSize, totalCount));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("students")]
        public async Task<IActionResult> GetAllStudents([FromQuery]StudentQueries queries)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            
            var users = await _serviceManager.UserService.GetAllStudentUsers(userId, queries);
            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("students/paginated")]
        public async Task<IActionResult> GetAllStudentsPaginated([FromQuery] StudentQueries queries)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var (users, totalCount) = await _serviceManager.UserService.GetAllStudentUsersWithPaginationAsync(userId, queries);
            return Ok(PagedResponse<StudentUserDto>.SuccessResponse(users, queries.PageNumber, queries.PageSize, totalCount));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("ungraduate-students")]
        public async Task<IActionResult> GetAllUnGraduateStudents([FromQuery]StudentQueries queries)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            
            var users = await _serviceManager.UserService.GetUnGraduateStudentUsers(userId, queries);
            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("ungraduate-students/paginated")]
        public async Task<IActionResult> GetAllUnGraduateStudentsPaginated([FromQuery] StudentQueries queries)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var (users, totalCount) = await _serviceManager.UserService.GetUnGraduateStudentUsersWithPaginationAsync(userId, queries);
            return Ok(PagedResponse<StudentUserDto>.SuccessResponse(users, queries.PageNumber, queries.PageSize, totalCount));
        }

    }
}