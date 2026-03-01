using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.AuthDtos
{
    public class UserResultDto
    {
        public string Id { get; set; }
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public string Token { get; set; }
        public string AcademicCode { get; set; }
        public string PhoneNumber { get; set; }
        public List<string> Roles { get; set; }
        public string UserName { get; set; }
        public int? TotalCredits { get; set; } = null;
        public int? AllowedCredits { get; set; } = null;
        public decimal? TotalGPA { get; set; } = null;
        public string? Specialization { get; set; } = null;
        public Levels? Level { get; set; }
        public string? Department { get; set; }
        public int? DepartmentId { get; set; }
        public string? ProfilePicture { get; set; } = null;
        public Gender Gender { get; set; }
    }

}
