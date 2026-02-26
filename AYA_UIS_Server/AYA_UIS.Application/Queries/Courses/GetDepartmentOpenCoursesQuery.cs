using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.CourseDtos;
using MediatR;

namespace AYA_UIS.Application.Queries.Courses
{
    public class GetDepartmentOpenCoursesQuery : IRequest<IEnumerable<CourseDto>>
    {
        public int DepartmentId {get; set;}

        public GetDepartmentOpenCoursesQuery(int departmentId)
        {
            DepartmentId = departmentId;
        }
    }
}