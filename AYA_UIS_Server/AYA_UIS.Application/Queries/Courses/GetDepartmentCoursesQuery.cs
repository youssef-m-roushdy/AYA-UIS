using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Core.Domain.Queries;
using MediatR;
using Shared.Dtos.Info_Module.CourseDtos;

namespace AYA_UIS.Application.Queries.Courses
{
    public class GetDepartmentCoursesQuery : IRequest<IEnumerable<CourseDto>>
    {
        public int DepartmentId { get; set; }
        public DepartmentCourseQuery Query { get; set; }

        public GetDepartmentCoursesQuery(int departmentId, DepartmentCourseQuery query)       
        {
            Query = query;
            DepartmentId = departmentId;
        }
    }
}