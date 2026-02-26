using AYA_UIS.Domain.Entities.Models;

namespace AYA_UIS.Domain.Contracts
{
    public interface IAcademicScheduleRepository : IGenericRepository<AcademicSchedule, int>
    {
        Task<AcademicSchedule?> GetByTitleAsync(string title);
        Task<IEnumerable<AcademicSchedule>> GetAllWithDetailsAsync();
        Task<AcademicSchedule?> UploadSemesterAcademicScheduleAsync(AcademicSchedule schedule);
        Task<AcademicSchedule?> GetBySemesterIdAsync(int semesterId);
    }
}
