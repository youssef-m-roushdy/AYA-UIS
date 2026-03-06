using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using AYA_UIS.Application.Dtos.RegistrationDtos;
using AYA_UIS.Application.Queries.Registrations;
using AYA_UIS.Domain.Contracts;
using MediatR;

namespace AYA_UIS.Application.Handlers.Registrations
{
    public class GetAllSemesterRegistrationsQueryHandler : IRequestHandler<GetAllSemesterRegistrationsQuery, (List<RegistrationDto> Data, int TotalCount)>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetAllSemesterRegistrationsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<(List<RegistrationDto> Data, int TotalCount)> Handle(
            GetAllSemesterRegistrationsQuery request, CancellationToken cancellationToken)
        {
            var studyYear = await _unitOfWork.StudyYears.GetByIdAsync(request.StudyYearId);
            if (studyYear == null)
                throw new Exception($"Study year with id {request.StudyYearId} not found.");

            var semester = await _unitOfWork.Semesters.GetByIdAsync(request.SemesterId);
            if (semester == null)
                throw new Exception($"Semester with id {request.SemesterId} not found.");

            var isSemesterInStudyYear = await _unitOfWork.Semesters.IsSemesterBelongsToStudyYearAsync(request.SemesterId, request.StudyYearId);
            if (!isSemesterInStudyYear)
                throw new Exception($"Semester with id {request.SemesterId} does not belong to study year with id {request.StudyYearId}.");

            var (registrations, totalCount) = await _unitOfWork.Registrations
                .GetAllSemesterRegistrationsPaginatedAsync(request.SemesterId, request.StudyYearId, request.RegistrationQuery, cancellationToken);

            if (registrations == null || !registrations.Any())
                return (new List<RegistrationDto>(), 0);

            return (_mapper.Map<List<RegistrationDto>>(registrations), totalCount);
        }
    }
}