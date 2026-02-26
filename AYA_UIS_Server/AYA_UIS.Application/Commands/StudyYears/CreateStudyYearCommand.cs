using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.StudyYearDtos;
using MediatR;

namespace AYA_UIS.Application.Commands.StudyYears
{
    public class CreateStudyYearCommand : IRequest<int>
    {
        public CreateStudyYearDto StudyYearDto { get; set; }

        public CreateStudyYearCommand(CreateStudyYearDto studyYearDto)
        {
            StudyYearDto = studyYearDto;
        }
    }
}