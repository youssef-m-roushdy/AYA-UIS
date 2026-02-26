using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using AYA_UIS.Application.Dtos.CourseDtos;
using AYA_UIS.Application.Queries.Courses;
using AYA_UIS.Domain.Contracts;
using AYA_UIS.Shared.Exceptions;
using MediatR;

namespace AYA_UIS.Application.Handlers.Courses
{
    public class GetDepartmentOpenCoursesQueryHandler : IRequestHandler<GetDepartmentOpenCoursesQuery, IEnumerable<CourseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public GetDepartmentOpenCoursesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CourseDto>> Handle(GetDepartmentOpenCoursesQuery request, CancellationToken cancellationToken)
        {
            var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId);
            if(department == null)
                throw new NotFoundException("No department found");
            
            var courses = await _unitOfWork.Courses.GetOpenCoursesAsync();
            return _mapper.Map<IEnumerable<CourseDto>>(courses);
        }
    }
}