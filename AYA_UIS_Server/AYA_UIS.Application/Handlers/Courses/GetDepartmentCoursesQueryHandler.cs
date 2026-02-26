using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using AYA_UIS.Application.Dtos.CourseDtos;
using AYA_UIS.Application.Queries.Courses;
using AYA_UIS.Domain.Contracts;
using MediatR;

namespace AYA_UIS.Application.Handlers.Courses
{
    public class GetDepartmentCoursesQueryHandler : IRequestHandler<GetDepartmentCoursesQuery, IEnumerable<CourseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetDepartmentCoursesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CourseDto>> Handle(GetDepartmentCoursesQuery request, CancellationToken cancellationToken)
        {
            var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId);
            if (department == null)            {
                throw new Exception("Department not found");
            }
            var courses = await _unitOfWork.Courses.GetDepartmentCoursesAsync(request.DepartmentId, request.Query);
            return _mapper.Map<IEnumerable<CourseDto>>(courses);
        }
    }
}