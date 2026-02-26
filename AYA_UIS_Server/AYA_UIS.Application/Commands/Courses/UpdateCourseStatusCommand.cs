using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.CourseDtos;
using MediatR;

namespace AYA_UIS.Application.Commands.Courses
{
    public class UpdateCourseStatusCommand : IRequest<Unit>
    {
        public UpdateCourseStatusDto Dto { get; set; }

        public UpdateCourseStatusCommand(UpdateCourseStatusDto dto)
        {
            Dto = dto;
        }
    }
}