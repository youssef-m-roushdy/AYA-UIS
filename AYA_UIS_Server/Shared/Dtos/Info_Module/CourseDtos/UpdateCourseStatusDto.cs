using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Core.Domain.Enums;

namespace Shared.Dtos.Info_Module.CourseDtos
{
    public class UpdateCourseStatusDto
    {
        public int CourseId { get; set; }
        public CourseStatus Status { get; set; }
    }
}