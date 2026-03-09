using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Models;
using AYA_UIS.Domain.Enums;
using AYA_UIS.Domain.Queries;
using AYA_UIS.Shared.Exceptions;
using AYA_UIS.Infrastructure.Presistence.Extensions;
using Microsoft.EntityFrameworkCore;

namespace AYA_UIS.Infrastructure.Presistence.Repositories
{
    public class CourseRepository : GenericRepository<Course, int>, ICourseRepository
    {
        public CourseRepository(UniversityDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<(IEnumerable<Course> Data, int TotalCount)> GetFilteredCoursesWithPaginationAsync(CourseQuery query)
        {
            var courses = _dbContext.Courses
                .Include(d => d.Department)
                .AsNoTracking()
                .AsQueryable();

            if (query.Status.HasValue)
                courses = courses.Where(c => c.Status == query.Status.Value);

            if (!string.IsNullOrEmpty(query.Code))
                courses = courses.Where(c => c.Code.Contains(query.Code));

            if (!string.IsNullOrEmpty(query.Name))
                courses = courses.Where(c => c.Name.Contains(query.Name));

            if (query.DepartmentId.HasValue)
                courses = courses.Where(c => c.DepartmentId == query.DepartmentId.Value);

            // Apply sorting
            courses = courses.ApplySorting(query.SortBy ?? "Id", query.SortDirection);

            // Get total count before pagination
            var totalCount = await courses.CountAsync();

            // Apply pagination
            courses = courses.ApplyPagination(query);

            var data = await courses.ToListAsync();
            return (data, totalCount);
        }

        public async Task<IEnumerable<Course>> GetFilteredCoursesAsync(CourseQuery query)
        {
            // Start with IQueryable - NO ToListAsync() yet!
            var courses = _dbContext.Courses
                .Include(d => d.Department)
                .AsNoTracking()
                .AsQueryable(); // This is IQueryable

            // Build the query - these become SQL WHERE clauses
            if (query.Status.HasValue)
                courses = courses.Where(c => c.Status == query.Status.Value);

            if (!string.IsNullOrEmpty(query.Code))
                courses = courses.Where(c => c.Code.Contains(query.Code));

            if (!string.IsNullOrEmpty(query.Name))
                courses = courses.Where(c => c.Name.Contains(query.Name));

            if (query.DepartmentId.HasValue)
                courses = courses.Where(c => c.DepartmentId == query.DepartmentId.Value);

            // ONLY NOW execute the query against the database
            return await courses.ToListAsync();
        }
        public async Task<Course?> GetCourseUplaodsAsync(int id)
        {
            return await _dbContext.Courses
                .Include(c => c.CourseUpload)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<(IEnumerable<Course> Data, int TotalCount)> GetDepartmentCoursesWithPaginationAsync(int departmentId, DepartmentCourseQuery query)
        {
            var queryable = _dbContext.Courses
                .Where(c => c.DepartmentId == departmentId)
                .AsNoTracking()
                .AsQueryable();

            if (query.Status.HasValue)
                queryable = queryable.Where(c => c.Status == query.Status.Value);

            // Apply sorting
            queryable = queryable.ApplySorting(query.SortBy ?? "Id", query.SortDirection);

            // Get total count before pagination
            var totalCount = await queryable.CountAsync();

            // Apply pagination
            queryable = queryable.ApplyPagination(query);

            var data = await queryable.ToListAsync();
            return (data, totalCount);
        }

        public Task<IEnumerable<Course>> GetDepartmentCoursesAsync(int departmentId, DepartmentCourseQuery query)
        {
            var queryable = _dbContext.Courses
                .Where(c => c.DepartmentId == departmentId)
                .AsNoTracking()
                .AsQueryable();

            if (query.Status.HasValue)
                queryable = queryable.Where(c => c.Status == query.Status.Value);

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

        public async Task<IEnumerable<Course>> GetAllPrerequisitesForOpenCoursesAsync()
        {
            return await _dbContext.CoursePrerequisites
                .Where(cp => cp.Course.Status == CourseStatus.Opened)
                .Include(cp => cp.PrerequisiteCourse)
                .Select(cp => cp.PrerequisiteCourse)
                .Distinct()
                .ToListAsync();
        }

        public async Task<IEnumerable<CoursePrerequisite>> GetCoursePrerequisiteMappingsForOpenCoursesAsync()
        {
            return await _dbContext.CoursePrerequisites
                .Where(cp => cp.Course.Status == CourseStatus.Opened)
                .Include(cp => cp.PrerequisiteCourse)
                .AsNoTracking()
                .ToListAsync();
        }

    }
}
