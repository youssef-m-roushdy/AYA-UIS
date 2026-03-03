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
    public class GetDepartmentCoursesQueryHandler : IRequestHandler<GetDepartmentCoursesQuery, PagedResponse<DepartmentCourseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetDepartmentCoursesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PagedResponse<DepartmentCourseDto>> Handle(GetDepartmentCoursesQuery request, CancellationToken cancellationToken)
        {
            var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId);
            if (department == null)
            {
                throw new Exception("Department not found");
            }
            var (courses, totalCount) = await _unitOfWork.Courses.GetDepartmentCoursesWithPaginationAsync(request.DepartmentId, request.Query);
            var result = _mapper.Map<IEnumerable<DepartmentCourseDto>>(courses);
            return PagedResponse<DepartmentCourseDto>.SuccessResponse(result, request.Query.PageNumber, request.Query.PageSize, totalCount);
        }
    }
}