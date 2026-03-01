using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.CourseDtos
{
    public class DepartmentCourseDto
    {
        public int Id {get; set;}
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public CourseStatus Status { get; set; }
        public int Credits { get; set; }
    }
}