using AYA_UIS.Domain.Entities.Models;

namespace AYA_UIS.Domain.Contracts
{
    public interface IFeeRepository : IGenericRepository<Fee, int>
    {
        Task<IEnumerable<Fee>> GetFeesOfDepartmentForStudyYear(int departmentId, int studyYearId);
      

        Task<IEnumerable<Fee>> GetFeesOfStudyYear(int studyYearId);
       
    }
}
