using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Domain.Queries
{
    public class RegistrationQuery : PaginationQuery
    {
        public string? StudentUserName { get; set; }
        public string? CourseName { get; set; }
        public string? AcademicCode { get; set; }
        public string? CourseCode { get; set; }
        public RegistrationStatus? Status { get; set; }
    }
}