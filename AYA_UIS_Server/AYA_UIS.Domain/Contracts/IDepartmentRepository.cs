using AYA_UIS.Domain.Entities.Models;

namespace AYA_UIS.Domain.Contracts
{
    public interface IDepartmentRepository : IGenericRepository<Department, int>
    {
        Task<Department?> GetByNameAsync(string name);
        Task<Department?> GetByIdWithDetailsAsync(int id);
        Task<IEnumerable<Department>> GetAllWithDetailsAsync();
    }
}
