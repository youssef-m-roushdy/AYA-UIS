using AYA_UIS.Application.Dtos.UserStudyYearDtos;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Commands.UserStudyYears
{
    public class CreateUserStudyYearCommand : IRequest<Response<UserStudyYearDto>>
    {
        public CreateUserStudyYearDto Dto { get; set; } = null!;

        public CreateUserStudyYearCommand(CreateUserStudyYearDto dto)
        {
            Dto = dto;
        }
    }
}
