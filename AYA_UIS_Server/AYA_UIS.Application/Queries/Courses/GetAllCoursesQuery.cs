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
    public class GetAllCoursesQuery : IRequest<Response<IEnumerable<CourseDto>>>
    {
        public CourseQuery Query { get; set; }

        public GetAllCoursesQuery(CourseQuery query)
        {
            Query = query;
        }
    }
}