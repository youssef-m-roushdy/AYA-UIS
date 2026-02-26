using AYA_UIS.Application.Dtos.AcademicSheduleDtos;
using MediatR;

namespace AYA_UIS.Application.Queries.AcademicSchedules
{
    public class GetAllAcademicSchedulesQuery : IRequest<List<AcademicSchedulesDto>>
    {
    }
}