using AYA_UIS.Domain.Entities.Models;

namespace AYA_UIS.Domain.Contracts
{
    public interface IRegistrationRepository : IGenericRepository<Registration, int>
    {
        Task<IEnumerable<Registration>> GetByUserIdAsync(string userId);
        Task<IEnumerable<Registration>> GetByCourseIdAsync(int courseId);
        Task<Registration?> GetByUserAndCourseAsync(string userId, int courseId, int studyYearId);
        Task<IEnumerable<Registration>> GetByUserAndStudyYearAsync(string userId, int studyYearId);
        public Task<IEnumerable<Registration>> GetByUserAndStudyYearAndSemseterAsync(string userId, int studyYearId, int semesterId);
        Task<IEnumerable<Registration>> GetByUserAsync(string userId, int? studyYearId = null);
        Task<IEnumerable<Registration>> GetAllAsync(int? courseId = null, int? studyYearId = null, int? semesterId = null, string? userId = null);
        public Task<bool> IsUserRegisteredInCourseAsync(string userId, int courseId);

        public Task<bool> IsCourseCompletedByUserAsync(string userId, int courseId);
    }
}
