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
using Shared.Common;
using AYA_UIS.Shared.Exceptions;
using AYA_UIS.Domain.Enums;
using AYA_UIS.Application.Dtos.AuthDtos;
using AYA_UIS.Domain.Contracts;

namespace AYA_UIS.Infrastructure.Presistence.Services
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly UserManager<User> _userManager;
        private readonly IOptions<JwtOptions> _options;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IUnitOfWork _unitOfWork;

        public AuthenticationService(
            UserManager<User> userManager,
            IOptions<JwtOptions> options,
            RoleManager<IdentityRole> roleManager,
            IUnitOfWork unitOfWork)
        {
            _userManager = userManager;
            _options = options;
            _roleManager = roleManager;
            _unitOfWork = unitOfWork;
        }

        // LoginAsync
        #region Before Security 
        public async Task<UserResultDto> LoginAsync(LoginDto loginDto)
        {


            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user is null) throw new NotFoundException($"There is no user with email '{loginDto.Email}'.");

            var validPassword = await _userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!validPassword) throw new UnauthorizedAccessException();

            var department = user.DepartmentId.HasValue
                ? await _unitOfWork.Departments.GetByIdAsync(user.DepartmentId.Value) // check from department because identity db separate from main db and user can be admin or stuff member without department
                : null;
            if (department == null)
            {
                // this case it is admin or stuff member
                return new UserResultDto
                {
                    Id = user.Id,
                    DisplayName = user.DisplayName,
                    Token = await CreateTokenAsync(user),
                    Email = user.Email,
                    Role = (await _userManager.GetRolesAsync(user)).FirstOrDefault(),
                    AcademicCode = user.Academic_Code,
                    UserName = user.UserName,
                    TotalCredits = null, // null he is not student
                    AllowedCredits = null, // null he is not student
                    TotalGPA = null, // null he is not student
                    Specialization = null, // null he is not student
                    Level = user.Level, // null he is not student
                    PhoneNumber = user.PhoneNumber,
                    DepartmentName = null, // // null he is not student,
                    Gender = user.Gender,
                    DepartmentId = null,
                    ProfilePicture = user.ProfilePicture
                };
            }

            var roles = await _userManager.GetRolesAsync(user);

            return new UserResultDto{
                Id = user.Id,
                DisplayName = user.DisplayName,
                Token = await CreateTokenAsync(user),
                Email = user.Email,
                Role = roles.FirstOrDefault(),
                AcademicCode = user.Academic_Code,
                UserName = user.UserName,
                TotalCredits = null, // null he is not student
                AllowedCredits = null, // null he is not student
                TotalGPA = null, // null he is not student
                Specialization = null, // null he is not student
                Level = user.Level, // null he is not student
                PhoneNumber = user.PhoneNumber,
                DepartmentName = department.Name,
                Gender = user.Gender,
                DepartmentId = department.Id,
                ProfilePicture = user.ProfilePicture
            };
        }
        #endregion



        // RegisterAsync
        public async Task<UserResultDto> RegisterAsync(RegisterDto registerDto, string role = "Student")
        {
            var ChekInputValidation = new List<string>();

            if (await _userManager.Users.AnyAsync(u => u.Academic_Code == registerDto.Academic_Code))
                ChekInputValidation.Add("Academic Code already exists.");

            if (await _userManager.Users.AnyAsync(u => u.UserName == registerDto.UserName))
                ChekInputValidation.Add("UserName already exists.");

            if (await _userManager.Users.AnyAsync(u => u.Email == registerDto.Email))
                ChekInputValidation.Add("Email already exists.");


            if (ChekInputValidation.Any())
                throw new ValidationException(ChekInputValidation);


            var user = new User
            {
                DisplayName = registerDto.DisplayName,
                Email = registerDto.Email,
                UserName = registerDto.UserName,   
                PhoneNumber = registerDto.PhoneNumber,
                Academic_Code = registerDto.Academic_Code,
                Gender = registerDto.Gender
            };



            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                throw new ValidationException(errors);
            }

            
            // Add specified role
            if (await _roleManager.RoleExistsAsync(role))
                await _userManager.AddToRoleAsync(user, role);

          
            var roles = await _userManager.GetRolesAsync(user);

            var token = await CreateTokenAsync(user);
            return new UserResultDto
            {
                Id = user.Id,
                DisplayName = user.DisplayName,
                Email = user.Email,
                Token = token,
                AcademicCode = user.Academic_Code,
                Role = roles.FirstOrDefault(),
                UserName = user.UserName,
                TotalCredits = null, // null he is not student
                AllowedCredits = user.AllowedCredits, // null he is not student
                TotalGPA = user.TotalGPA, // null he is not student
                Specialization = user.Specialization, // null he is not student
                Level = user.Level, // null he is not student
                PhoneNumber = user.PhoneNumber,
                DepartmentName = null,// // null he is not student
                DepartmentId = user.DepartmentId,
                ProfilePicture = user.ProfilePicture          
            };
        }

        public async Task<UserResultDto> RegisterStudentAsync(int departmentId, RegisterStudentDto registerStudentDto)
        {
            var ChekInputValidation = new List<string>();

            if (await _userManager.Users.AnyAsync(u => u.Academic_Code == registerStudentDto.Academic_Code))
                ChekInputValidation.Add("Academic Code already exists.");

            if (await _userManager.Users.AnyAsync(u => u.UserName == registerStudentDto.UserName))
                ChekInputValidation.Add("UserName already exists.");

            if (await _userManager.Users.AnyAsync(u => u.Email == registerStudentDto.Email))
                ChekInputValidation.Add("Email already exists.");


            if (ChekInputValidation.Any())
                throw new ValidationException(ChekInputValidation);

            // Determine starting level based on department
            var department = await _unitOfWork.Departments.GetByIdAsync(departmentId);
            if (department == null)
                throw new NotFoundException($"There is no department with id '{departmentId}'.");

            var startingLevel = department.HasPreparatoryYear
                ? Levels.Preparatory_Year
                : Levels.First_Year;

            var user = new User
            {
                DisplayName = registerStudentDto.DisplayName,
                Email = registerStudentDto.Email,
                UserName = registerStudentDto.UserName,   
                PhoneNumber = registerStudentDto.PhoneNumber,
                Academic_Code = registerStudentDto.Academic_Code,
                Level = startingLevel,
                TotalCredits = 0,
                AllowedCredits = 0,
                TotalGPA = 0,
                DepartmentId = departmentId,
                Gender = registerStudentDto.Gender
            };



            var result = await _userManager.CreateAsync(user, registerStudentDto.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                throw new ValidationException(errors);
            }

            
            // Add Student role
            if (await _roleManager.RoleExistsAsync("Student"))
                await _userManager.AddToRoleAsync(user, "Student");

          
            var roles = await _userManager.GetRolesAsync(user);

            var token = await CreateTokenAsync(user);
            return new UserResultDto
            {
                Id = user.Id,
                DisplayName = user.DisplayName,
                Email = user.Email,
                Token = token,
                AcademicCode = user.Academic_Code,
                Role = roles.FirstOrDefault(),
                UserName = user.UserName,
                TotalCredits = user.TotalCredits, 
                AllowedCredits = user.AllowedCredits, 
                TotalGPA = user.TotalGPA, 
                Specialization = user.Specialization, 
                Level = user.Level, 
                PhoneNumber = user.PhoneNumber,
                DepartmentName = department.Name,
                ProfilePicture = user.ProfilePicture,
                Gender = user.Gender
            };
        }


        // ResetPasswordAsync
        public async Task<string> ResetPasswordAsync(string email, string newPassword) 
        { var user = await _userManager.FindByEmailAsync(email);

            if (user == null) throw new NotFoundException($"There is no user with email '{email}'.");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user); 

            var result = await _userManager.ResetPasswordAsync(user, token, newPassword); 

            return result.Succeeded ? "Password Updated Successfully" 
                : string.Join(" | ", result.Errors.Select(e => e.Description)); 
        
        }


        // UpdateRoleByEmailAsync
        public async Task<string> UpdateRoleByEmailAsync(string email, string newRole)
        {
            var user = await _userManager.FindByEmailAsync(email); if (user == null) throw new NotFoundException($"There is no user with email '{email}'.");

             if (!await _roleManager.RoleExistsAsync(newRole)) 
                throw new NotFoundException($"Role '{newRole}' does not exist.");
            // Remove old roles

            var oldRoles = await _userManager.GetRolesAsync(user); 
            await _userManager.RemoveFromRolesAsync(user, oldRoles); 

            // Add new role
            var result = await _userManager.AddToRoleAsync(user, newRole);

            if (!result.Succeeded) 
                return "Failed to update role";
            
            return $"Role updated to {newRole} successfully"; }


        // Token ==> Encrypted String ==> Return String 

        private async Task<string> CreateTokenAsync(User user)
        {
            var jwtOptions = _options.Value;
            // 1] Create Claims 
            // Name - Email - Roles [M-M]

            var claims = new List<Claim>()
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name , user.DisplayName),
                new Claim (ClaimTypes.Email , user.Email),
            };

            var roles = await _userManager.GetRolesAsync(user);
            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));

            // 2] Secret Key 
            //0a6d8ce9afd9c2791f4028e6308550716cbe69b4d82ab0ae7640bbd76319643a
            var privateKey = await File.ReadAllTextAsync("Keys/private_key.pem");

            var rsa = RSA.Create();
            rsa.ImportFromPem(privateKey);

            var key = new RsaSecurityKey(rsa);

            // 3] Algo 

            var SingInCreds = new SigningCredentials(key, SecurityAlgorithms.RsaSha512);

            // 4] Generate Token 

            var token = new JwtSecurityToken(issuer: jwtOptions.Issuer, audience: jwtOptions.Audience, claims: claims, expires: DateTime.UtcNow.AddDays(jwtOptions.ExpirationInDay), signingCredentials: SingInCreds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
