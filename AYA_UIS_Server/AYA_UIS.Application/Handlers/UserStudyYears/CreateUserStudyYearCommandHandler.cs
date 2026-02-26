using AYA_UIS.Application.Commands.UserStudyYears;
using AYA_UIS.Application.Dtos.UserStudyYearDtos;
using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Models;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Handlers.UserStudyYears
{
    public class CreateUserStudyYearCommandHandler : IRequestHandler<CreateUserStudyYearCommand, Response<UserStudyYearDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateUserStudyYearCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Response<UserStudyYearDto>> Handle(CreateUserStudyYearCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Dto;

            // Validate StudyYear exists
            var studyYear = await _unitOfWork.StudyYears.GetByIdAsync(dto.StudyYearId);
            if (studyYear is null)
                return Response<UserStudyYearDto>.ErrorResponse("Study year not found.");

            // Check if already enrolled in this study year
            var existing = await _unitOfWork.UserStudyYears.GetByUserAndStudyYearAsync(dto.UserId, dto.StudyYearId);
            if (existing is not null)
                return Response<UserStudyYearDto>.ErrorResponse("User is already enrolled in this study year.");

            var entity = new UserStudyYear
            {
                UserId = dto.UserId,
                StudyYearId = dto.StudyYearId,
                Level = dto.Level,
                EnrolledAt = DateTime.UtcNow
            };

            await _unitOfWork.UserStudyYears.AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();

            // Re-fetch with includes
            var saved = await _unitOfWork.UserStudyYears.GetByUserAndStudyYearAsync(dto.UserId, dto.StudyYearId);

            var resultDto = MapToDto(saved!);
            return Response<UserStudyYearDto>.SuccessResponse(resultDto);
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
