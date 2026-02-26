using AYA_UIS.Application.Dtos.UserStudyYearDtos;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Queries.UserStudyYears
{
    public class GetUserStudyYearTimelineQuery : IRequest<Response<UserStudyYearTimelineDto>>
    {
        public string UserId { get; set; } = string.Empty;

        public GetUserStudyYearTimelineQuery(string userId)
        {
            UserId = userId;
        }
    }
}
