using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.CourseDtos;
using AYA_UIS.Domain.Queries;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Queries.Courses
{
    public class GetDepartmentCoursesQuery : IRequest<PagedResponse<DepartmentCourseDto>>
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