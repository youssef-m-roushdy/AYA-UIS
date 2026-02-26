
using AYA_UIS.Domain.Entities.Models;

namespace AYA_UIS.Domain.Contracts
{
    public interface ICourseUploadsRepository : IGenericRepository<CourseUpload, int>
    {
        Task<IEnumerable<CourseUpload>> GetByCourseIdAsync(int courseId);
        Task<IEnumerable<CourseUpload>> GetByUserIdAsync(string userId);
    }
}
