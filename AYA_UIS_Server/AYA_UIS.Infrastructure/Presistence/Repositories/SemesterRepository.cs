using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;

namespace AYA_UIS.Infrastructure.Presistence.Repositories
{
    public class SemesterRepository : GenericRepository<Semester, int>, ISemesterRepository
    {
        public SemesterRepository(UniversityDbContext dbContext) : base(dbContext)
        {

        }

        public async Task<IEnumerable<Semester>> GetByStudyYearIdAsync(int studyYearId)
        {
            return await _dbContext.Semesters
                .Where(s => s.StudyYearId == studyYearId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Semester?> GetActiveSemesterByStudyYearIdAsync(int studyYearId)
        {
            return await _dbContext.Semesters
                .Where(s => s.StudyYearId == studyYearId && s.IsActive)
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }

        public async Task<bool> IsActiveSemesterAsync(int semesterId)
        {
            return await _dbContext.Semesters
                .AnyAsync(s => s.Id == semesterId && s.IsActive);
        }

        public async Task<bool> IsSemesterBelongsToStudyYearAsync(int semesterId, int studyYearId)
        {
            return await _dbContext.Semesters
                .AnyAsync(s => s.Id == semesterId && s.StudyYearId == studyYearId);
        }
    }
}