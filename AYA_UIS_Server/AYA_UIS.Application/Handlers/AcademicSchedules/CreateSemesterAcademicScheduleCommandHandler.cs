using AYA_UIS.Application.Commands.AcademicSchedules;
using AYA_UIS.Application.Contracts;
using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Models;
using AYA_UIS.Shared.Exceptions;
using MediatR;

namespace AYA_UIS.Application.Handlers.AcademicSchedules
{
    public class CreateSemesterAcademicScheduleCommandHandler : IRequestHandler<CreateSemesterAcademicScheduleCommand, Unit>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICloudinaryService _cloudinaryService;

        public CreateSemesterAcademicScheduleCommandHandler(IUnitOfWork unitOfWork, ICloudinaryService cloudinaryService)
        {
            _unitOfWork = unitOfWork;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<Unit> Handle(CreateSemesterAcademicScheduleCommand request, CancellationToken cancellationToken)
        {
            var studyYear = await _unitOfWork.StudyYears.GetByIdAsync(request.StudyYearId);
            if (studyYear == null)                
                throw new NotFoundException("Study year not found");
            var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId);
            if (department == null)                
                throw new NotFoundException("Department not found");
            var semester = await _unitOfWork.Semesters.GetByIdAsync(request.SemesterId);
            if (semester == null)                
                throw new NotFoundException("Semester not found");

            var fileId = Guid.NewGuid().ToString();
            var fileUrl = await _cloudinaryService.UploadAcademicScheduleAsync(request.CreateAcademicScheduleDto.File, fileId, cancellationToken);

            var entity = new AcademicSchedule
            {
                Title = request.CreateAcademicScheduleDto.Title,
                FileId = fileId,
                Url = fileUrl,
                Description = request.CreateAcademicScheduleDto.Description,
                UploadedByUserId = request.UploadedByUserId,
                DepartmentId = request.DepartmentId,
                StudyYearId = request.StudyYearId,
                SemesterId = request.SemesterId,
                ScheduleDate = DateTime.UtcNow,
            };

            await _unitOfWork.AcademicSchedules.AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();

            return Unit.Value;
        }
    }
}