using AYA_UIS.Application.Dtos.AcademicSheduleDtos;
using MediatR;

namespace AYA_UIS.Application.Queries.AcademicSchedules
{
    public class GetAcademicScheduleByTitleQuery : IRequest<AcademicSchedulesDto>
    {
        public string ScheduleTitle { get; set; }

        public GetAcademicScheduleByTitleQuery(string scheduleTitle)
        {
            ScheduleTitle = scheduleTitle;
        }
    }
}