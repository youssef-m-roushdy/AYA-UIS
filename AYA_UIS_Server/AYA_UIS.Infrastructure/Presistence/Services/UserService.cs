using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Contracts;
using AYA_UIS.Application.Dtos.UserDtos;
using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Identity;
using AYA_UIS.Domain.Queries;
using AYA_UIS.Shared.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AYA_UIS.Infrastructure.Presistence.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<User> _userManager;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICloudinaryService _cloudinaryService;

        public UserService(UserManager<User> userManager, ILogger<UserService> logger, ICloudinaryService cloudinaryService, IUnitOfWork unitOfWork)
        {
            _userManager = userManager;
            _cloudinaryService = cloudinaryService;
            _unitOfWork = unitOfWork;
        }

        public Task<IEnumerable<UserDto>> GetAllUsers(UserQueries query)
        {
            throw new NotImplementedException();
        }

        public async Task<userProfileDetailsDto> GetUserProfileByAcademicCodeAsync(string academicCode)
        {
            try
            {
                var user = await _userManager.Users
                    
                    .FirstOrDefaultAsync(u => u.Academic_Code == academicCode);

                if (user == null)
                    throw new NotFoundException($"User with academic code '{academicCode}' not found.");

                var department = user.DepartmentId.HasValue
                    ? await _unitOfWork.Departments.GetByIdAsync(user.DepartmentId.Value)
                    : null;
                if(department == null)
                    throw new NotFoundException($"Department with ID '{user.DepartmentId}' not found.");

                var roles = await _userManager.GetRolesAsync(user);

                return new userProfileDetailsDto
                {
                    Id = user.Id,
                    DisplayName = user.DisplayName,
                    Email = user.Email,
                    UserName = user.UserName,
                    PhoneNumber = user.PhoneNumber,
                    ProfilePicture = user.ProfilePicture,
                    AcademicCode = user.Academic_Code,
                    Level = user.Level,
                    TotalCredits = user.TotalCredits,
                    AllowedCredits = user.AllowedCredits,
                    TotalGPA = user.TotalGPA,
                    Specialization = user.Specialization,
                    DepartmentName = department.Name,
                    Role = roles.FirstOrDefault(),
                    
                };
            }
            catch (Exception ex)
            {
                throw new InternalServerErrorException($"An error occurred while retrieving the user profile for academic code '{academicCode}'.", ex);
            }
        }

        public async Task UpdateProfilePictureAsync(string userId, UpdateProfilePictureDto dto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    throw new NotFoundException($"User with ID '{userId}' not found.");

                user.ProfilePicture = await _cloudinaryService.UploadUserProfilePictureAsync(dto.ProfilePicture, userId);

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description).ToList();
                    throw new ValidationException(errors);
                }
            }
            catch (Exception ex)
            {
                throw new InternalServerErrorException($"An error occurred while updating the profile picture for user ID '{userId}'.", ex);
            }
        }

        public async Task UpdateStudentSpecializationAsync(string academicCode, UpdateStudentSpecializationDto dto)
        {
            try
            {
                var user = await _userManager.Users
                    .FirstOrDefaultAsync(u => u.Academic_Code == academicCode);

                if (user == null)
                    throw new NotFoundException($"Student with academic code '{academicCode}' not found.");

                // Validate that the user is a student
                var roles = await _userManager.GetRolesAsync(user);
                if (!roles.Contains("Student"))
                {
                    var errors = roles.Select(r => $"User does not have the required role: {r}").ToList();
                    throw new ValidationException(errors);
                }

                user.Specialization = dto.Specialization;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description).ToList();
                    throw new ValidationException(errors);
                }
            }
            catch (Exception ex)
            {
                throw new InternalServerErrorException($"An error occurred while updating the specialization for student with academic code '{academicCode}'.", ex);
            }
        }

    }
}