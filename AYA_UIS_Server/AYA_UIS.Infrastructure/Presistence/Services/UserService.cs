using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using AYA_UIS.Application.Contracts;
using AYA_UIS.Application.Dtos.UserDtos;
using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Identity;
using AYA_UIS.Domain.Enums;
using AYA_UIS.Domain.Queries;
using AYA_UIS.Shared.Exceptions;
using AYA_UIS.Infrastructure.Presistence.Extensions;
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
        private readonly UniversityDbContext _dbContext;
        private readonly IMapper _mapper;

        public UserService(UserManager<User> userManager, ILogger<UserService> logger, ICloudinaryService cloudinaryService, IUnitOfWork unitOfWork, UniversityDbContext dbContext, IMapper mapper)
        {
            _userManager = userManager;
            _cloudinaryService = cloudinaryService;
            _unitOfWork = unitOfWork;
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsers(string userId, UserQueries query)
        {
            
            var usersQuery = _dbContext.Users
                .Where(u => u.Id != userId)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Department)
                .AsQueryable();

            // Filter by Role
            if (!string.IsNullOrEmpty(query.Role))
                usersQuery = usersQuery.Where(u => u.UserRoles.Any(ur => ur.Role.Name == query.Role));

            // Filter by Academic Code
            if (!string.IsNullOrEmpty(query.Academic_Code))
                usersQuery = usersQuery.Where(u => u.AcademicCode == query.Academic_Code);

            // Filter by Name
            if (!string.IsNullOrEmpty(query.Name))
                usersQuery = usersQuery.Where(u => u.DisplayName.Contains(query.Name));

            // Filter by Gender
            if (query.Gender.HasValue)
                usersQuery = usersQuery.Where(u => u.Gender == query.Gender.Value);

            // Filter by Level
            if (query.Level.HasValue)
                usersQuery = usersQuery.Where(u => u.Level == query.Level.Value);

            // Filter by DepartmentId
            if (query.DepartmentId.HasValue)
                usersQuery = usersQuery.Where(u => u.DepartmentId == query.DepartmentId.Value);

            var users = await usersQuery.ToListAsync();

            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task<(IEnumerable<UserDto> Data, int TotalCount)> GetAllUsersWithPaginationAsync(string userId, UserQueries query)
        {
            var usersQuery = _dbContext.Users
                .Where(u => u.Id != userId)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Department)
                .AsNoTracking()
                .AsQueryable();

            // Filter by Role
            if (!string.IsNullOrEmpty(query.Role))
                usersQuery = usersQuery.Where(u => u.UserRoles.Any(ur => ur.Role.Name == query.Role));

            // Filter by Academic Code
            if (!string.IsNullOrEmpty(query.Academic_Code))
                usersQuery = usersQuery.Where(u => u.AcademicCode.Contains(query.Academic_Code));

            // Filter by Name
            if (!string.IsNullOrEmpty(query.Name))
                usersQuery = usersQuery.Where(u => u.DisplayName.Contains(query.Name));

            // Filter by Gender
            if (query.Gender.HasValue)
                usersQuery = usersQuery.Where(u => u.Gender == query.Gender.Value);

            // Filter by Level
            if (query.Level.HasValue)
                usersQuery = usersQuery.Where(u => u.Level == query.Level.Value);


            // Filter by DepartmentId
            if (query.DepartmentId.HasValue)
                usersQuery = usersQuery.Where(u => u.DepartmentId == query.DepartmentId.Value);

            // Apply sorting
            usersQuery = usersQuery.ApplySorting(query.SortBy ?? "DisplayName", query.SortDirection);

            // Get total count before pagination
            var totalCount = await usersQuery.CountAsync();

            // Apply pagination
            usersQuery = usersQuery.ApplyPagination(query);

            var users = await usersQuery.ToListAsync();
            var result = _mapper.Map<IEnumerable<UserDto>>(users);

            return (result, totalCount);
        }

        public async Task<IEnumerable<UserDto>> GetUnGraduateStudentUsers(string userId, StudentQueries query)
        {
            
            var usersQuery = _dbContext.Users
                .Where(u => u.Id != userId && u.Level != Levels.Graduate)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Department)
                .AsQueryable();

         
            usersQuery = usersQuery.Where(u => u.UserRoles.Any(ur => ur.Role.Name == "Student"));

            // Filter by Academic Code
            if (!string.IsNullOrEmpty(query.Academic_Code))
                usersQuery = usersQuery.Where(u => u.AcademicCode.Contains(query.Academic_Code));

            // Filter by Name
            if (!string.IsNullOrEmpty(query.Name))
                usersQuery = usersQuery.Where(u => u.DisplayName.Contains(query.Name));

            // Filter by Gender
            if (query.Gender.HasValue)
                usersQuery = usersQuery.Where(u => u.Gender == query.Gender.Value);

            // Filter by Level
            if (query.Level.HasValue)
                usersQuery = usersQuery.Where(u => u.Level == query.Level.Value);

            // Filter by Min GPA
            if (query.MinGPA.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalGPA >= query.MinGPA.Value);

            // Filter by Max GPA
            if (query.MaxGPA.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalGPA <= query.MaxGPA.Value);

            // Filter by Min Credits
            if (query.MinCredits.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalCredits >= query.MinCredits.Value);

            // Filter by Max Credits
            if (query.MaxCredits.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalCredits <= query.MaxCredits.Value);

            // Filter by Specialization
            if (!string.IsNullOrEmpty(query.Specialization))
                usersQuery = usersQuery.Where(u => u.Specialization.Contains(query.Specialization));

            // Filter by DepartmentId
            if (query.DepartmentId.HasValue)
                usersQuery = usersQuery.Where(u => u.DepartmentId == query.DepartmentId.Value);

            var users = await usersQuery.ToListAsync();

            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task<(IEnumerable<UserDto> Data, int TotalCount)> GetUnGraduateStudentUsersWithPaginationAsync(string userId, StudentQueries query)
        {
            var usersQuery = _dbContext.Users
                .Where(u => u.Id != userId && u.Level != Levels.Graduate)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Department)
                .AsNoTracking()
                .AsQueryable();

            usersQuery = usersQuery.Where(u => u.UserRoles.Any(ur => ur.Role.Name == "Student"));

            // Filter by Academic Code
            if (!string.IsNullOrEmpty(query.Academic_Code))
                usersQuery = usersQuery.Where(u => u.AcademicCode.Contains(query.Academic_Code));

            // Filter by Name
            if (!string.IsNullOrEmpty(query.Name))
                usersQuery = usersQuery.Where(u => u.DisplayName.Contains(query.Name));

            // Filter by Gender
            if (query.Gender.HasValue)
                usersQuery = usersQuery.Where(u => u.Gender == query.Gender.Value);

            // Filter by Level
            if (query.Level.HasValue)
                usersQuery = usersQuery.Where(u => u.Level == query.Level.Value);

            // Filter by Min GPA
            if (query.MinGPA.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalGPA >= query.MinGPA.Value);

            // Filter by Max GPA
            if (query.MaxGPA.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalGPA <= query.MaxGPA.Value);

            // Filter by Min Credits
            if (query.MinCredits.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalCredits >= query.MinCredits.Value);

            // Filter by Max Credits
            if (query.MaxCredits.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalCredits <= query.MaxCredits.Value);

            // Filter by Specialization
            if (!string.IsNullOrEmpty(query.Specialization))
                usersQuery = usersQuery.Where(u => u.Specialization.Contains(query.Specialization));

            // Filter by DepartmentId
            if (query.DepartmentId.HasValue)
                usersQuery = usersQuery.Where(u => u.DepartmentId == query.DepartmentId.Value);

            // Apply sorting
            usersQuery = usersQuery.ApplySorting(query.SortBy ?? "DisplayName", query.SortDirection);

            // Get total count before pagination
            var totalCount = await usersQuery.CountAsync();

            // Apply pagination
            usersQuery = usersQuery.ApplyPagination(query);

            var users = await usersQuery.ToListAsync();
            var result = _mapper.Map<IEnumerable<UserDto>>(users);

            return (result, totalCount);
        }

        public async Task<IEnumerable<UserDto>> GetAllStudentUsers(string userId, StudentQueries query)
        {
            
            var usersQuery = _dbContext.Users
                .Where(u => u.Id != userId)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Department)
                .AsQueryable();

         
            usersQuery = usersQuery.Where(u => u.UserRoles.Any(ur => ur.Role.Name == "Student"));

            // Filter by Academic Code
            if (!string.IsNullOrEmpty(query.Academic_Code))
                usersQuery = usersQuery.Where(u => u.AcademicCode.Contains(query.Academic_Code));

            // Filter by Name
            if (!string.IsNullOrEmpty(query.Name))
                usersQuery = usersQuery.Where(u => u.DisplayName.Contains(query.Name));

            // Filter by Gender
            if (query.Gender.HasValue)
                usersQuery = usersQuery.Where(u => u.Gender == query.Gender.Value);

            // Filter by Level
            if (query.Level.HasValue)
                usersQuery = usersQuery.Where(u => u.Level == query.Level.Value);

            // Filter by Min GPA
            if (query.MinGPA.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalGPA >= query.MinGPA.Value);

            // Filter by Max GPA
            if (query.MaxGPA.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalGPA <= query.MaxGPA.Value);

            // Filter by Min Credits
            if (query.MinCredits.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalCredits >= query.MinCredits.Value);

            // Filter by Max Credits
            if (query.MaxCredits.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalCredits <= query.MaxCredits.Value);

            // Filter by Specialization
            if (!string.IsNullOrEmpty(query.Specialization))
                usersQuery = usersQuery.Where(u => u.Specialization.Contains(query.Specialization));

            // Filter by DepartmentId
            if (query.DepartmentId.HasValue)
                usersQuery = usersQuery.Where(u => u.DepartmentId == query.DepartmentId.Value);

            var users = await usersQuery.ToListAsync();

            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task<(IEnumerable<UserDto> Data, int TotalCount)> GetAllStudentUsersWithPaginationAsync(string userId, StudentQueries query)
        {
            var usersQuery = _dbContext.Users
                .Where(u => u.Id != userId)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Department)
                .AsNoTracking()
                .AsQueryable();

            usersQuery = usersQuery.Where(u => u.UserRoles.Any(ur => ur.Role.Name == "Student"));

            // Filter by Academic Code
            if (!string.IsNullOrEmpty(query.Academic_Code))
                usersQuery = usersQuery.Where(u => u.AcademicCode.Contains(query.Academic_Code));

            // Filter by Name
            if (!string.IsNullOrEmpty(query.Name))
                usersQuery = usersQuery.Where(u => u.DisplayName.Contains(query.Name));

            // Filter by Gender
            if (query.Gender.HasValue)
                usersQuery = usersQuery.Where(u => u.Gender == query.Gender.Value);

            // Filter by Level
            if (query.Level.HasValue)
                usersQuery = usersQuery.Where(u => u.Level == query.Level.Value);

            // Filter by Min GPA
            if (query.MinGPA.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalGPA >= query.MinGPA.Value);

            // Filter by Max GPA
            if (query.MaxGPA.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalGPA <= query.MaxGPA.Value);

            // Filter by Min Credits
            if (query.MinCredits.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalCredits >= query.MinCredits.Value);

            // Filter by Max Credits
            if (query.MaxCredits.HasValue)
                usersQuery = usersQuery.Where(u => u.TotalCredits <= query.MaxCredits.Value);

            // Filter by Specialization
            if (!string.IsNullOrEmpty(query.Specialization))
                usersQuery = usersQuery.Where(u => u.Specialization.Contains(query.Specialization));

            // Filter by DepartmentId
            if (query.DepartmentId.HasValue)
                usersQuery = usersQuery.Where(u => u.DepartmentId == query.DepartmentId.Value);

            // Apply sorting
            usersQuery = usersQuery.ApplySorting(query.SortBy ?? "DisplayName", query.SortDirection);

            // Get total count before pagination
            var totalCount = await usersQuery.CountAsync();

            // Apply pagination
            usersQuery = usersQuery.ApplyPagination(query);

            var users = await usersQuery.ToListAsync();
            var result = _mapper.Map<IEnumerable<UserDto>>(users);

            return (result, totalCount);
        }

        public async Task<userProfileDetailsDto> GetUserProfileByAcademicCodeAsync(string academicCode)
        {
            try
            {
                var user = await _userManager.Users
                    
                    .FirstOrDefaultAsync(u => u.AcademicCode == academicCode);

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
                    AcademicCode = user.AcademicCode,
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
                    .FirstOrDefaultAsync(u => u.AcademicCode == academicCode);

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