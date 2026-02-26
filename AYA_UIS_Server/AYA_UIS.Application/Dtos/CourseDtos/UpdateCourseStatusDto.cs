using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.CourseDtos
{
    public class UpdateCourseStatusDto
    {
        public int CourseId { get; set; }
        public CourseStatus Status { get; set; }
    }
}