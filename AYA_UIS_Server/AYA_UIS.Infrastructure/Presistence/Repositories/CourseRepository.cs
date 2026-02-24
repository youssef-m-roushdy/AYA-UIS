using AYA_UIS.Core.Domain.Entities.Models;
using AYA_UIS.Core.Domain.Enums;
using AYA_UIS.Core.Domain.Queries;
using AYA_UIS.Shared.Exceptions;
using Domain.Contracts;
using Microsoft.EntityFrameworkCore;
using Presistence;

namespace Presistence.Repositories
{
    public class CourseRepository : GenericRepository<Course, int>, ICourseRepository
    {
        public CourseRepository(UniversityDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<IEnumerable<Course>> GetFilteredCoursesAsync(CourseQuery query)
        {
            var courses = await _dbContext.Courses
                .AsNoTracking()
                .ToListAsync();
            if (courses == null || !courses.Any())
                return null;

            var filteredCourses = courses.Where(course =>
            {
                if (query.Status.HasValue && course.Status != query.Status.Value)
                    return false;

                if (!string.IsNullOrEmpty(query.Code) && !course.Code.Contains(query.Code, StringComparison.OrdinalIgnoreCase))
                    return false;

                if (!string.IsNullOrEmpty(query.Name) && !course.Name.Contains(query.Name, StringComparison.OrdinalIgnoreCase))
                    return false;

                if (query.DepartmentId.HasValue && course.DepartmentId != query.DepartmentId.Value)
                    return false;

                return true;
            });
            return filteredCourses.ToList();
        }
        public async Task<Course?> GetCourseUplaodsAsync(int id)
        {
            return await _dbContext.Courses
                .Include(c => c.CourseUpload)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public Task<IEnumerable<Course>> GetDepartmentCoursesAsync(int departmentId, DepartmentCourseQuery query)
        {
            var queryable = _dbContext.Courses
                .Where(c => c.DepartmentId == departmentId)
                .AsNoTracking();

            if (query.Status.HasValue)
            {
                queryable = queryable.Where(c => c.Status == query.Status.Value);
            }

            return queryable.ToListAsync()
                .ContinueWith(t => t.Result.AsEnumerable());
        }

        public Task<IEnumerable<Course>> GetPassedCoursesByUserAsync(string userId)
        {
            return _dbContext.Registrations
                .Where(r => r.UserId == userId && r.IsPassed)
                .Include(r => r.Course)
                .AsNoTracking()
                .Select(r => r.Course)
                .ToListAsync()
                .ContinueWith(t => t.Result.AsEnumerable());
        }

        public async Task<IEnumerable<Course>> GetCoursePrerequisitesAsync(int courseId)
        {
            return await _dbContext.CoursePrerequisites
                .Where(cp => cp.CourseId == courseId)
                .Include(cp => cp.PrerequisiteCourse)
                .Select(cp => cp.PrerequisiteCourse)
                .ToListAsync();
        }

        public async Task<IEnumerable<Course>> GetCourseDependenciesAsync(int courseId)
        {
            return await _dbContext.CoursePrerequisites
                .Where(cp => cp.PrerequisiteCourseId == courseId)  // Fixed: Use PrerequisiteCourseId instead of RequiredCourseId
                .Include(cp => cp.Course)
                .Select(cp => cp.Course)
                .ToListAsync();
        }

        public async Task<IEnumerable<Course>> GetOpenCoursesAsync()
        {
            return await _dbContext.Courses
                .Where(c => c.Status == CourseStatus.Opened)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task UpdateCourseStatusAsync(int courseId, CourseStatus newStatus)
        {
            await _dbContext.Courses
                .Where(c => c.Id == courseId)
                .ExecuteUpdateAsync(s => s.SetProperty(c => c.Status, newStatus));
        }

    }
}
