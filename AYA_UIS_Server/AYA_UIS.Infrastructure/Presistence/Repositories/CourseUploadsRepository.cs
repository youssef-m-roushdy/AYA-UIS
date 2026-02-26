using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Presistence;

namespace AYA_UIS.Infrastructure.Presistence.Repositories
{
    public class CourseUploadsRepository : GenericRepository<CourseUpload, int>, ICourseUploadsRepository
    {
        public CourseUploadsRepository(UniversityDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<IEnumerable<CourseUpload>> GetByCourseIdAsync(int courseId)
        {
            return await _dbContext.CourseUploads
                .Where(cu => cu.CourseId == courseId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<CourseUpload>> GetByUserIdAsync(string userId)
        {
            return await _dbContext.CourseUploads
                .Where(cu => cu.UploadedByUserId == userId)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
