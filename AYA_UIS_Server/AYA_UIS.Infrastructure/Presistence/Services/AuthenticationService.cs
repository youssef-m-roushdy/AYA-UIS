using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using AYA_UIS.Application.Contracts;
using AYA_UIS.Domain.Entities.Identity;
using AYA_UIS.Shared.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using AYA_UIS.Shared.Exceptions;
using AYA_UIS.Domain.Enums;
using AYA_UIS.Application.Dtos.AuthDtos;
using AYA_UIS.Domain.Contracts;
using Shared.Settings;
using Shared.Respones;

namespace AYA_UIS.Infrastructure.Presistence.Services
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly IJwtService _jwtService;
        private readonly JwtSettings _settings;
        private readonly IUnitOfWork _unitOfWork;
        private readonly UniversityDbContext _context; // ← ADD

        public AuthenticationService(
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            IJwtService jwtService,
            IOptions<JwtSettings> settings,
            IUnitOfWork unitOfWork,
            UniversityDbContext context) // ← ADD
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _jwtService = jwtService;
            _settings = settings.Value;
            _unitOfWork = unitOfWork;
            _context = context; // ← ADD
        }

        // ── Login ──────────────────────────────────────────────────────────────
        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userManager.Users
                .Include(u => u.RefreshTokens)          // ← load tokens
                .FirstOrDefaultAsync(u => u.Email == dto.Email)
                ?? throw new NotFoundException($"No user with email '{dto.Email}'.");

            if (!await _userManager.CheckPasswordAsync(user, dto.Password))
                throw new UnauthorizedAccessException("Invalid credentials.");

            var roles = await _userManager.GetRolesAsync(user);

            var department = user.DepartmentId.HasValue
                ? await _unitOfWork.Departments.GetByIdAsync(user.DepartmentId.Value)
                : null;

            return await BuildAuthResponseAsync(user, roles, department);
        }

        // ── Register (admin / staff) ────────────────────────────────────────────
        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto, string role = "Student")
        {
            await ValidateUniqueFieldsAsync(dto.AcademicCode, dto.UserName, dto.Email);

            var user = new User
            {
                DisplayName = dto.DisplayName,
                Email = dto.Email,
                UserName = dto.UserName,
                PhoneNumber = dto.PhoneNumber,
                AcademicCode = dto.AcademicCode,
                Gender = dto.Gender
            };

            await CreateUserAsync(user, dto.Password, role);

            // Reload with RefreshTokens tracked
            var trackedUser = await _userManager.Users
                .Include(u => u.RefreshTokens)
                .FirstAsync(u => u.Id == user.Id);

            var roles = await _userManager.GetRolesAsync(trackedUser);
            return await BuildAuthResponseAsync(trackedUser, roles, department: null);
        }

        // ── Register student ───────────────────────────────────────────────────
        public async Task<AuthResponseDto> RegisterStudentAsync(int departmentId, RegisterStudentDto dto)
        {
            await ValidateUniqueFieldsAsync(dto.AcademicCode, dto.UserName, dto.Email);

            var department = await _unitOfWork.Departments.GetByIdAsync(departmentId)
                ?? throw new NotFoundException($"No department with id '{departmentId}'.");

            var startingLevel = department.HasPreparatoryYear
                ? Levels.Preparatory_Year
                : Levels.First_Year;

            var user = new User
            {
                DisplayName = dto.DisplayName,
                Email = dto.Email,
                UserName = dto.UserName,
                PhoneNumber = dto.PhoneNumber,
                AcademicCode = dto.AcademicCode,
                Gender = dto.Gender,
                Level = startingLevel,
                TotalCredits = 0,
                AllowedCredits = 0,
                TotalGPA = 0,
                DepartmentId = departmentId
            };

            await CreateUserAsync(user, dto.Password, "Student");

            // Reload with RefreshTokens tracked
            var trackedUser = await _userManager.Users
                .Include(u => u.RefreshTokens)
                .FirstAsync(u => u.Id == user.Id);

            var roles = await _userManager.GetRolesAsync(trackedUser);
            return await BuildAuthResponseAsync(trackedUser, roles, department);
        }

        // ── Refresh token ──────────────────────────────────────────────────────
        public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
        {
            // DEBUG — remove after fixing
            var allTokens = await _userManager.Users
                .Include(u => u.RefreshTokens)
                .SelectMany(u => u.RefreshTokens)
                .ToListAsync();

            Console.WriteLine($"Total refresh tokens in DB: {allTokens.Count}");
            Console.WriteLine($"Looking for token: {refreshToken[..20]}...");
            foreach (var t in allTokens)
                Console.WriteLine($"  DB token: {t.Token[..20]}... | Active: {t.IsActive} | Revoked: {t.IsRevoked} | Expired: {t.IsExpired}");

            var user = await _userManager.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.RefreshTokens.Any(rt => rt.Token == refreshToken))
                ?? throw new UnauthorizedAccessException("Invalid refresh token.");

            var stored = user.RefreshTokens.First(rt => rt.Token == refreshToken);

            if (!stored.IsActive)
                throw new UnauthorizedAccessException("Refresh token is expired or revoked.");

            // Rotate — revoke old, issue new
            stored.IsRevoked = true;
            await _userManager.UpdateAsync(user);

            var roles = await _userManager.GetRolesAsync(user);
            var department = user.DepartmentId.HasValue
                ? await _unitOfWork.Departments.GetByIdAsync(user.DepartmentId.Value)
                : null;

            return await BuildAuthResponseAsync(user, roles, department);
        }

        // ── Revoke (logout) ────────────────────────────────────────────────────
        public async Task RevokeTokenAsync(string refreshToken)
        {
            var token = await _context.Set<RefreshToken>()
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken)
                ?? throw new UnauthorizedAccessException("Token not found.");

            token.IsRevoked = true;
            await _context.SaveChangesAsync();
        }

        // ── Reset password ─────────────────────────────────────────────────────
        public async Task<string> ResetPasswordAsync(string email, string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email)
                ?? throw new NotFoundException($"No user with email '{email}'.");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

            return result.Succeeded
                ? "Password updated successfully."
                : string.Join(" | ", result.Errors.Select(e => e.Description));
        }


        // ── Private helpers ────────────────────────────────────────────────────

        private async Task ValidateUniqueFieldsAsync(string academicCode, string userName, string email)
        {
            var errors = new List<string>();

            if (await _userManager.Users.AnyAsync(u => u.AcademicCode == academicCode))
                errors.Add("Academic code already exists.");
            if (await _userManager.Users.AnyAsync(u => u.UserName == userName))
                errors.Add("Username already exists.");
            if (await _userManager.Users.AnyAsync(u => u.Email == email))
                errors.Add("Email already exists.");

            if (errors.Any()) throw new ValidationException(errors);
        }

        private async Task CreateUserAsync(User user, string password, string role)
        {
            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
                throw new ValidationException(result.Errors.Select(e => e.Description).ToList());

            if (await _roleManager.RoleExistsAsync(role))
                await _userManager.AddToRoleAsync(user, role);
        }

        private async Task<AuthResponseDto> BuildAuthResponseAsync(
            User user,
            IList<string> roles,
            dynamic? department)
        {
            var accessToken = await _jwtService.GenerateAccessTokenAsync(user);
            var refreshToken = _jwtService.GenerateRefreshToken();

            refreshToken.UserId = user.Id;

            // ← Save directly to DbContext, NOT via UpdateAsync
            await _context.Set<RefreshToken>().AddAsync(refreshToken);
            await _context.SaveChangesAsync();

            PruneOldTokens(user);

            bool isStudent = department != null;

            return new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                AccessTokenExpiry = DateTime.UtcNow.AddMinutes(_settings.AccessTokenExpirationMinutes),
                User = new UserInfoDto
                {
                    Id = user.Id,
                    UserName = user.UserName ?? string.Empty,
                    Email = user.Email ?? string.Empty,
                    DisplayName = user.DisplayName ?? string.Empty,
                    ProfilePicture = user.ProfilePicture,
                    AcademicCode = user.AcademicCode,
                    PhoneNumber = user.PhoneNumber,
                    Gender = user.Gender,
                    Roles = roles.ToList(),
                    Level = isStudent ? user.Level : null,
                    TotalCredits = isStudent ? user.TotalCredits : null,
                    AllowedCredits = isStudent ? user.AllowedCredits : null,
                    TotalGPA = isStudent ? user.TotalGPA : null,
                    Specialization = isStudent ? user.Specialization : null,
                    DepartmentId = isStudent ? user.DepartmentId : null,
                    Department = isStudent ? department!.Code : null,
                }
            };
        }

        private static void PruneOldTokens(User user)
        {
            var toRemove = user.RefreshTokens
                .Where(t => !t.IsActive)
                .OrderBy(t => t.CreatedAt)
                .SkipLast(5)
                .ToList();

            foreach (var t in toRemove)
                user.RefreshTokens.Remove(t);
        }



    }
}
