using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using AYA_UIS.Application.Dtos.CourseDtos;
using AYA_UIS.Application.Queries.Courses;
using AYA_UIS.Domain.Contracts;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Handlers.Courses
{
    public class GetAllCoursesQueryHandler : IRequestHandler<GetAllCoursesQuery, Response<IEnumerable<CourseDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetAllCoursesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
        public async Task<Response<IEnumerable<CourseDto>>> Handle(GetAllCoursesQuery request, CancellationToken cancellationToken)
        {
            var courses = await _unitOfWork.Courses.GetFilteredCoursesAsync(request.Query);
            var result = _mapper.Map<IEnumerable<CourseDto>>(courses);
            return Response<IEnumerable<CourseDto>>.SuccessResponse(result);
        }
    }
}