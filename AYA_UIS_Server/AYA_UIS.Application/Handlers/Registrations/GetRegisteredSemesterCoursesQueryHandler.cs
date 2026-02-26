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
    public class GetRegisteredSemesterCoursesQueryHandler : IRequestHandler<GetRegisteredSemesterCoursesQuery, List<RegistrationCourseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetRegisteredSemesterCoursesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<RegistrationCourseDto>> Handle(GetRegisteredSemesterCoursesQuery request, CancellationToken cancellationToken)
        {
            var registrations = await _unitOfWork.Registrations.GetByUserAndStudyYearAndSemseterAsync(request.StudentId, request.StudyYearId, request.SemesterId);

            var registrationCourseDtos = _mapper.Map<List<RegistrationCourseDto>>(registrations);

            return registrationCourseDtos;
        }
    }
}