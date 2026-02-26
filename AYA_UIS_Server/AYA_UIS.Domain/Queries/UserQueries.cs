using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Domain.Queries
{
    public class UserQueries
    {
        public string? Academic_Code { get; set; }
        public Gender? Gender { get; set; }
        public Levels? Level { get; set; } 
        public int? TotalCredits { get; set; }
        public int? AllowedCredits { get; set; }
        public decimal? TotalGPA { get; set; } 
        public string? Specialization { get; set; }
        public int? DepartmentId { get; set; }
        public string? Role { get; set; }
    }
}