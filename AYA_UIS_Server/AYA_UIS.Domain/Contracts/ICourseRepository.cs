using AYA_UIS.Domain.Entities.Models;
using AYA_UIS.Domain.Enums;
using AYA_UIS.Domain.Queries;

namespace AYA_UIS.Domain.Contracts
{
    public interface ICourseRepository : IGenericRepository<Course, int>
    {
        Task<IEnumerable<Course>> GetFilteredCoursesAsync(CourseQuery query);
        Task<Course?> GetCourseUplaodsAsync(int id);
        Task<IEnumerable<Course>> GetDepartmentCoursesAsync(int departmentId, DepartmentCourseQuery query);
        Task<IEnumerable<Course>> GetCourseDependenciesAsync(int courseId);
        Task<IEnumerable<Course>> GetCoursePrerequisitesAsync(int courseId);
        Task<IEnumerable<Course>> GetPassedCoursesByUserAsync(string userId);
        Task<IEnumerable<Course>> GetOpenCoursesAsync();
        Task UpdateCourseStatusAsync(int courseId, CourseStatus newStatus);
    }
}
