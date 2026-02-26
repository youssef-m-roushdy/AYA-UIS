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
    public class GetRegisteredYearCoursesQueryHandler : IRequestHandler<GetRegisteredYearCoursesQuery, List<RegistrationCourseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetRegisteredYearCoursesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<RegistrationCourseDto>> Handle(GetRegisteredYearCoursesQuery request, CancellationToken cancellationToken)
        {
            var registrations = await _unitOfWork.Registrations.GetByUserAndStudyYearAsync(request.StudentId, request.Year);

            var registrationCourseDtos = _mapper.Map<List<RegistrationCourseDto>>(registrations);

            return registrationCourseDtos;
        }   
    }
}