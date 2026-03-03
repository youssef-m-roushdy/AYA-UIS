using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.UserDtos;
using AYA_UIS.Domain.Queries;

namespace AYA_UIS.Application.Contracts
{
    public interface IUserService
    {
        Task<userProfileDetailsDto> GetUserProfileByAcademicCodeAsync(string academicCode);
        Task UpdateProfilePictureAsync(string userId, UpdateProfilePictureDto dto);
        Task UpdateStudentSpecializationAsync(string academicCode, UpdateStudentSpecializationDto dto);
        Task<IEnumerable<UserDto>> GetAllUsers(string userId, UserQueries query);
        Task<(IEnumerable<UserDto> Data, int TotalCount)> GetAllUsersWithPaginationAsync(string userId, UserQueries query);
        Task<IEnumerable<UserDto>> GetUnGraduateStudentUsers(string userId, StudentQueries query);
        Task<(IEnumerable<UserDto> Data, int TotalCount)> GetUnGraduateStudentUsersWithPaginationAsync(string userId, StudentQueries query);
        Task<IEnumerable<UserDto>> GetAllStudentUsers(string userId, StudentQueries query);
        Task<(IEnumerable<UserDto> Data, int TotalCount)> GetAllStudentUsersWithPaginationAsync(string userId, StudentQueries query);
    }
}