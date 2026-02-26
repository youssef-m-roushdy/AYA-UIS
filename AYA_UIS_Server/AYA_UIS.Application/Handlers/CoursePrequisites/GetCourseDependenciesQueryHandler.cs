using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using AYA_UIS.Application.Dtos.CourseDtos;
using AYA_UIS.Application.Queries.CoursePrequisites;
using AYA_UIS.Domain.Contracts;
using MediatR;

namespace AYA_UIS.Application.Handlers.CoursePrequisites
{
    public class GetCourseDependenciesQueryHandler : IRequestHandler<GetCourseDependenciesQuery, List<CourseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetCourseDependenciesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<CourseDto>> Handle(GetCourseDependenciesQuery request, CancellationToken cancellationToken)
        {
            var dependencies = await _unitOfWork.Courses.GetCourseDependenciesAsync(request.CourseId);

            var dependencyDtos = _mapper.Map<List<CourseDto>>(dependencies);

            return dependencyDtos;
        }
    }
}