using AYA_UIS.Application.Dtos.UserStudyYearDtos;
using AYA_UIS.Application.Queries.UserStudyYears;
using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Models;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Handlers.UserStudyYears
{
    public class GetCurrentUserStudyYearQueryHandler : IRequestHandler<GetCurrentUserStudyYearQuery, Response<UserStudyYearDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetCurrentUserStudyYearQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Response<UserStudyYearDto>> Handle(GetCurrentUserStudyYearQuery request, CancellationToken cancellationToken)
        {
            var current = await _unitOfWork.UserStudyYears.GetCurrentByUserIdAsync(request.UserId);
            if (current is null)
                return Response<UserStudyYearDto>.ErrorResponse("No current study year found for this user.");

            return Response<UserStudyYearDto>.SuccessResponse(MapToDto(current));
        }

        private static UserStudyYearDto MapToDto(UserStudyYear entity)
        {
            return new UserStudyYearDto
            {
                Id = entity.Id,
                UserId = entity.UserId,
                StudyYearId = entity.StudyYearId,
                StartYear = entity.StudyYear?.StartYear ?? 0,
                EndYear = entity.StudyYear?.EndYear ?? 0,
                Level = entity.Level,
                LevelName = entity.Level.ToString().Replace("_", " "),
                IsCurrent = entity.StudyYear?.IsCurrent ?? false,
                EnrolledAt = entity.EnrolledAt
            };
        }
    }
}
