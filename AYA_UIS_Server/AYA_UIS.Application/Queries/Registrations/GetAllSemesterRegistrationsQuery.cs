using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.RegistrationDtos;
using AYA_UIS.Domain.Entities.Models;
using AYA_UIS.Domain.Queries;
using MediatR;

namespace AYA_UIS.Application.Queries.Registrations
{
    public record GetAllSemesterRegistrationsQuery : IRequest<(List<RegistrationDto> Data, int TotalCount)>
    {
        public int SemesterId { get; set; }
        public int StudyYearId { get; set; }
        public RegistrationQuery? RegistrationQuery { get; set; }
        public GetAllSemesterRegistrationsQuery(int studyYearId, int semesterId, RegistrationQuery? registrationQuery = null)
        {
            SemesterId = semesterId;
            StudyYearId = studyYearId;
            RegistrationQuery = registrationQuery;
        }
    }
}