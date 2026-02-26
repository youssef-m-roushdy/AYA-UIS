using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AYA_UIS.Application.Dtos.CourseDtos
{
    public record CreateCourseDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int Credits { get; set; }
        public int DepartmentId { get; set; }
    }
}