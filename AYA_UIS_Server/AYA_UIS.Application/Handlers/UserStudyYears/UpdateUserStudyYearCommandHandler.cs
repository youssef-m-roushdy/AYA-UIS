using AYA_UIS.Application.Commands.UserStudyYears;
using AYA_UIS.Application.Dtos.UserStudyYearDtos;
using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Models;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Handlers.UserStudyYears
{
    public class UpdateUserStudyYearCommandHandler : IRequestHandler<UpdateUserStudyYearCommand, Response<UserStudyYearDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateUserStudyYearCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Response<UserStudyYearDto>> Handle(UpdateUserStudyYearCommand request, CancellationToken cancellationToken)
        {
            var entity = await _unitOfWork.UserStudyYears.GetByIdAsync(request.Id);
            if (entity is null)
                return Response<UserStudyYearDto>.ErrorResponse("User study year record not found.");

            var dto = request.Dto;

            if (dto.Level.HasValue)
                entity.Level = dto.Level.Value;

            await _unitOfWork.UserStudyYears.Update(entity);
            await _unitOfWork.SaveChangesAsync();

            // Re-fetch with includes
            var updated = await _unitOfWork.UserStudyYears.GetByUserAndStudyYearAsync(entity.UserId, entity.StudyYearId);

            return Response<UserStudyYearDto>.SuccessResponse(MapToDto(updated!));
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
