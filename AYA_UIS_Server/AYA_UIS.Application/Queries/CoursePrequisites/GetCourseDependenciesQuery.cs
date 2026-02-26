using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.CourseDtos;
using MediatR;

namespace AYA_UIS.Application.Queries.CoursePrequisites
{
    public class GetCourseDependenciesQuery : IRequest<List<CourseDto>>
    {
        public int CourseId { get; set; }
        public GetCourseDependenciesQuery(int courseId)
        {
            CourseId = courseId;
        }
    }
}