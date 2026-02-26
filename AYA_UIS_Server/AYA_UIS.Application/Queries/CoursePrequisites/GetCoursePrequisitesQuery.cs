using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.CourseDtos;
using MediatR;

namespace AYA_UIS.Application.Queries.CoursePrequisites
{
    public class GetCoursePrequisitesQuery : IRequest<List<CourseDto>>
    {
        public int CourseId { get; set; }
        public GetCoursePrequisitesQuery(int courseId)
        {
            CourseId = courseId;
        }
    }
}