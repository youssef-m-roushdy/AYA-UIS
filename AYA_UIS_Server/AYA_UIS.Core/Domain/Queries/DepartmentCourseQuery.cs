using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Core.Domain.Enums;

namespace AYA_UIS.Core.Domain.Queries
{
    public class DepartmentCourseQuery
    {
        public CourseStatus? Status { get; set; }
    }
}