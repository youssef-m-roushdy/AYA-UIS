using AYA_UIS.Application.Dtos.UserStudyYearDtos;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Commands.UserStudyYears
{
    public class UpdateUserStudyYearCommand : IRequest<Response<UserStudyYearDto>>
    {
        public int Id { get; set; }
        public UpdateUserStudyYearDto Dto { get; set; } = null!;

        public UpdateUserStudyYearCommand(int id, UpdateUserStudyYearDto dto)
        {
            Id = id;
            Dto = dto;
        }
    }
}
