using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Presistence;

namespace AYA_UIS.Infrastructure.Presistence.Repositories
{
    public class DepartmentRepository : GenericRepository<Department, int>, IDepartmentRepository
    {
        public DepartmentRepository(UniversityDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<Department?> GetByNameAsync(string name)
        {
            return await _dbContext.Departments
                .FirstOrDefaultAsync(d => d.Name == name);
        }

        public async Task<Department?> GetByIdWithDetailsAsync(int id)
        {
            return await _dbContext.Departments
                .Include(d => d.Courses)
                .Include(d => d.Fees)
                .Include(d => d.AcademicSchedules)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<IEnumerable<Department>> GetAllWithDetailsAsync()
        {
            return await _dbContext.Departments
                .Include(d => d.Courses)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}