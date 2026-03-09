using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using AYA_UIS.Application.Dtos.CourseDtos;
using AYA_UIS.Application.Queries.Courses;
using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Models;
using MediatR;

namespace AYA_UIS.Application.Handlers.Courses
{
    public class GetStudentRegistrationCoursesQueryHandler : IRequestHandler<GetStudentRegistrationCoursesQuery, IEnumerable<CourseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetStudentRegistrationCoursesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
        public async Task<IEnumerable<CourseDto>> Handle(GetStudentRegistrationCoursesQuery request, CancellationToken cancellationToken)
        {
            // ── 4 DB calls ────────────────────────────────────────────────────

            var passedRegistrations = await _unitOfWork.Registrations
                .GetStudentPassedCoursesAsync(request.UserId);

            // ✅ One call replaces GetInProgress + GetPending
            var semesterRegistrations = await _unitOfWork.Registrations
                .GetStudentSemesterRegistrationCoursesAsync(
                    request.UserId, request.StudyYearId, request.SemesterId);

            var prereqMappings = await _unitOfWork.Courses
                .GetCoursePrerequisiteMappingsForOpenCoursesAsync();

            var openCourses = await _unitOfWork.Courses
                .GetOpenCoursesAsync();

            // ── Build lookup sets ─────────────────────────────────────────────

            var passedCourseIds = passedRegistrations
                .Select(r => r.CourseId)
                .ToHashSet();

            // ✅ Exclude ALL existing semester registrations regardless of status
            // Only way course reappears is if admin DELETES the registration record
            var alreadyRegisteredCourseIds = semesterRegistrations
                .Select(r => r.CourseId)
                .ToHashSet();

            var prereqsByCourseId = prereqMappings
                .GroupBy(cp => cp.CourseId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(cp => cp.PrerequisiteCourse).ToList()
                );

            // ── Filter and map ────────────────────────────────────────────────

            var result = new List<CourseDto>();

            foreach (var course in openCourses)
            {
                // Skip if already passed in any previous year/semester
                if (passedCourseIds.Contains(course.Id))
                    continue;

                // Skip if any registration record exists this semester (any status)
                if (alreadyRegisteredCourseIds.Contains(course.Id))
                    continue;

                var prerequisites = prereqsByCourseId
                    .GetValueOrDefault(course.Id, new List<Course>());

                // Skip if prerequisites not all passed
                if (!prerequisites.All(p => passedCourseIds.Contains(p.Id)))
                    continue;

                result.Add(_mapper.Map<CourseDto>(course));
            }

            return result;
        }
    }
}