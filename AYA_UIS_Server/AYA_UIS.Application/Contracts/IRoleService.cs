using AYA_UIS.Application.Dtos.AuthDtos;
using Microsoft.AspNetCore.Identity;

namespace AYA_UIS.Application.Contracts
{
    public interface IRoleService
    {
        Task<IEnumerable<RoleDto>> GetAllRolesAsync();
        Task<RoleDto?> GetRoleByIdAsync(string roleId);
        Task<RoleDto?> GetRoleByNameAsync(string roleName);
        Task<IdentityResult> CreateRoleAsync(CreateRoleDto createRoleDto);
        Task<IdentityResult> UpdateRoleAsync(string roleId, UpdateRoleDto updateRoleDto);
        Task<IdentityResult> DeleteRoleAsync(string roleId);
        Task<IdentityResult> UpdateUserRoleByEmailAsync(UpdateUserRoleByEmailDto dto);
        Task<IEnumerable<string>> GetUserRolesAsync(string userId);
        Task<IdentityResult> UpdateUserRoleByAcademicCodeAsync(UpdateUserRoleDto dto);
        Task<UserRoleInfoDto> GetUserRoleInfoByAcademicCodeAsync(string academicCode);
    }
}
