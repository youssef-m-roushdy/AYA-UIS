using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Presistence;

namespace AYA_UIS.Infrastructure.Presistence.Repositories
{
    public class FeeRepository : GenericRepository<Fee, int>, IFeeRepository
    {
        public FeeRepository(UniversityDbContext dbContext) : base(dbContext)
        {
        }


        public async Task<IEnumerable<Fee>> GetFeesOfDepartmentForStudyYear(int departmentId, int studyYearId)
        {
            return await _dbContext.Fees
                .Where(f => f.DepartmentId == departmentId && f.StudyYearId == studyYearId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Fee>> GetFeesOfStudyYear(int studyYearId)
        {
            return await _dbContext.Fees
                .Where(f => f.StudyYearId == studyYearId)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
