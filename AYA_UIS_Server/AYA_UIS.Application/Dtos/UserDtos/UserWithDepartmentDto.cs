using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.UserDtos
{
    public class UserWithDepartmentDto
    {
        public string Id { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string ProfilePicture { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string AcademicCode { get; set; } = string.Empty;
        public string? Department { get; set; } = string.Empty;
        public Gender Gender { get; set; }
        public List<string> Roles { get; set; }
    }
}