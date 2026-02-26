using AYA_UIS.Domain.Entities.Models;

namespace AYA_UIS.Domain.Contracts
{
    public interface IStudyYearRepository : IGenericRepository<StudyYear, int>
    {
        Task<StudyYear?> GetCurrentStudyYearAsync();
        Task<bool> IsCurrentStudyYearAsync(int studyYearId);
    }
}
