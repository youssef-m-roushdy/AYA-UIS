using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Presistence;

namespace AYA_UIS.Infrastructure.Presistence.Repositories
{
    public class AcademicScheduleRepository : GenericRepository<AcademicSchedule, int>, IAcademicScheduleRepository
    {
        public AcademicScheduleRepository(UniversityDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<AcademicSchedule?> GetByTitleAsync(string title)
        {
            return await _dbContext.AcademicSchedules
                .FirstOrDefaultAsync(a => a.Title.Contains(title));
        }

        public async Task<IEnumerable<AcademicSchedule>> GetAllWithDetailsAsync()
        {
            return await _dbContext.AcademicSchedules
                .Include(a => a.Department)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<AcademicSchedule?> UploadSemesterAcademicScheduleAsync(AcademicSchedule schedule)
        {
            await _dbContext.AcademicSchedules.AddAsync(schedule);
            return schedule;
        }

        public async Task<AcademicSchedule?> GetBySemesterIdAsync(int semesterId)
        {
            return await _dbContext.AcademicSchedules
                .Where(a => a.SemesterId == semesterId)
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }
    }
}
