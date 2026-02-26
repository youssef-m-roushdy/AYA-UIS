using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.AcademicSheduleDtos;
using MediatR;

namespace AYA_UIS.Application.Queries.AcademicSchedules
{
    public class GetAcademicScheduleByIdQuery : IRequest<AcademicScheduleDto>
    {
        public int Id { get; init; }

        public GetAcademicScheduleByIdQuery(int id)
        {
            Id = id;
        }
    }
}