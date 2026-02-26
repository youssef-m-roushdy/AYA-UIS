using AYA_UIS.Application.Dtos.UserStudyYearDtos;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Queries.UserStudyYears
{
    public class GetUserStudyYearsQuery : IRequest<Response<List<UserStudyYearDto>>>
    {
        public string UserId { get; set; } = string.Empty;

        public GetUserStudyYearsQuery(string userId)
        {
            UserId = userId;
        }
    }
}
