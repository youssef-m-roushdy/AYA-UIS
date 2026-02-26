using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Presistence;

namespace AYA_UIS.Infrastructure.Presistence.Repositories
{
    public class StudyYearRepository : GenericRepository<StudyYear, int>, IStudyYearRepository
    {
        public StudyYearRepository(UniversityDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<StudyYear?> GetCurrentStudyYearAsync()
        {
            return await _dbContext.StudyYears
                .Where(sy => sy.IsCurrent)
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }

        public async Task<bool> IsCurrentStudyYearAsync(int studyYearId)
        {
            return await _dbContext.StudyYears
                .AnyAsync(sy => sy.Id == studyYearId && sy.IsCurrent);
        }
    }
}
