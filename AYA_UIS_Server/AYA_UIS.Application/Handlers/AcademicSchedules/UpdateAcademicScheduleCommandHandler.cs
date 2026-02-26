using AYA_UIS.Application.Commands.AcademicSchedules;
using AYA_UIS.Application.Contracts;
using AYA_UIS.Domain.Contracts;
using AYA_UIS.Shared.Exceptions;
using MediatR;

namespace AYA_UIS.Application.Handlers.AcademicSchedules
{
    public class UpdateAcademicScheduleCommandHandler : IRequestHandler<UpdateAcademicScheduleCommand, Unit>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICloudinaryService _cloudinaryService;

        public UpdateAcademicScheduleCommandHandler(IUnitOfWork unitOfWork, ICloudinaryService cloudinaryService)
        {
            _unitOfWork = unitOfWork;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<Unit> Handle(UpdateAcademicScheduleCommand request, CancellationToken cancellationToken)
        {
            var schedule = await _unitOfWork.AcademicSchedules.GetByTitleAsync(request.Title);

            if (schedule is null)
                throw new NotFoundException($"Academic schedule '{request.Title}' not found.");

            // Delete old file and upload new one
            if (!string.IsNullOrEmpty(schedule.FileId))
                await _cloudinaryService.DeleteImageAsync(schedule.FileId, cancellationToken);

            var newFileId = Guid.NewGuid().ToString();
            var newFileUrl = await _cloudinaryService.UploadAcademicScheduleAsync(request.File, newFileId, cancellationToken);

            schedule.FileId = newFileId;
            schedule.Url = newFileUrl;
            schedule.Title = request.Title;
            schedule.Description = request.Description;
            schedule.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.AcademicSchedules.Update(schedule);
            await _unitOfWork.SaveChangesAsync();

            return Unit.Value;
        }
    }
}
