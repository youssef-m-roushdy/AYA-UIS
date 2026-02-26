using AYA_UIS.Application.Dtos.UserStudyYearDtos;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Queries.UserStudyYears
{
    public class GetCurrentUserStudyYearQuery : IRequest<Response<UserStudyYearDto>>
    {
        public string UserId { get; set; } = string.Empty;

        public GetCurrentUserStudyYearQuery(string userId)
        {
            UserId = userId;
        }
    }
}
