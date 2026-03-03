using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Domain.Queries
{
    public class DepartmentCourseQuery : PaginationQuery
    {
        public CourseStatus? Status { get; set; }
    }
}