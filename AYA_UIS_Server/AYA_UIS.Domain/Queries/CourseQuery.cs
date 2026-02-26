using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Domain.Queries
{
    public class CourseQuery
    {
        public CourseStatus? Status { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public int? DepartmentId { get; set; }
    }
}