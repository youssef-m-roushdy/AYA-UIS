using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.AcademicSheduleDtos;
using MediatR;

namespace AYA_UIS.Application.Queries.AcademicSchedules
{
    public class GetAcademicSchedulesBySemesterIdQuery : IRequest<IEnumerable<AcademicScheduleDto>>
     {
        public int SemesterId { get; set; }

        public GetAcademicSchedulesBySemesterIdQuery(int semesterId)
        {
            SemesterId = semesterId;
        }
     }
}