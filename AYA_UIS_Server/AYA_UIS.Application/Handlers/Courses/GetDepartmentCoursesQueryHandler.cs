using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using AYA_UIS.Application.Queries.Courses;
using Domain.Contracts;
using MediatR;
using Shared.Dtos.Info_Module.CourseDtos;

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