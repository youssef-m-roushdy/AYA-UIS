using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.CourseDtos;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Commands.Courses
{
    public class CreateCourseCommand: IRequest<Response<CourseDto>>
    {
        public CreateCourseDto Course { get; set; }

        public CreateCourseCommand(CreateCourseDto course)
        {
            Course = course;
        }
    }
}