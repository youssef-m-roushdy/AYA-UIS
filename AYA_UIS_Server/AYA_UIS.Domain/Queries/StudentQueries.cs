using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Domain.Queries
{
    public class StudentQueries : PaginationQuery
    {
        public string? Academic_Code { get; set; }
        public string? Name { get; set; }
        public Gender? Gender { get; set; }
        public Levels? Level { get; set; }
        public int? DepartmentId { get; set; }
        public string? Specialization { get; set; }
        public decimal? MinGPA { get; set; }
        public decimal? MaxGPA { get; set; }
        public int? MinCredits { get; set; }
        public int? MaxCredits { get; set; }
    }
}