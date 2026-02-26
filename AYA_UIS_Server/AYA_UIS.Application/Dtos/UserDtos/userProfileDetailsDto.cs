using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.UserDtos
{
    public class userProfileDetailsDto
    {
        public string Id { get; set; }
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public string AcademicCode { get; set; }
        public string Role { get; set; }
        public string UserName { get; set; }
        public int? TotalCredits { get; set; }
        public int? AllowedCredits { get; set; }
        public decimal? TotalGPA { get; set; }
        public string? Specialization { get; set; }
        public Levels? Level { get; set; }
        public string DepartmentName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ProfilePicture { get; set; }
    }
}