using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.CourseDtos;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Queries.Courses
{
    public record GetCourseUploadsQuery(int CourseId) : IRequest<Response<CourseWithUploadsDto>>;
}
