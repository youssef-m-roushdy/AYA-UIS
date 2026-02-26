using AYA_UIS.Domain.Entities.Models;

namespace AYA_UIS.Domain.Contracts
{
    public interface IUserStudyYearRepository : IGenericRepository<UserStudyYear, int>
    {
        Task<IEnumerable<UserStudyYear>> GetByUserIdAsync(string userId);
        Task<UserStudyYear?> GetCurrentByUserIdAsync(string userId);
        Task<UserStudyYear?> GetByUserAndStudyYearAsync(string userId, int studyYearId);
        Task<IEnumerable<UserStudyYear>> GetByStudyYearIdAsync(int studyYearId);
        Task AddRangeAsync(IEnumerable<UserStudyYear> userStudyYears);
        Task<IEnumerable<UserStudyYear>> GetStudyYearsByUserIdAsync(string userId);
    }
}
