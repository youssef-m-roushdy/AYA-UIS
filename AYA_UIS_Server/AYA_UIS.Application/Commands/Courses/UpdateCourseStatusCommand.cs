using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Core.Domain.Entities.Models;
using AYA_UIS.Core.Domain.Enums;
using MediatR;
using Shared.Dtos.Info_Module.CourseDtos;

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