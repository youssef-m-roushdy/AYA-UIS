using AYA_UIS.Domain.Entities;

namespace AYA_UIS.Domain.Contracts
{
    public interface IUnitOfWork : IDisposable
    {
        IDepartmentRepository Departments { get; }
        ICourseRepository Courses { get; }
        IAcademicScheduleRepository AcademicSchedules { get; }
        IFeeRepository Fees { get; }
        IStudyYearRepository StudyYears { get; }
        IRegistrationRepository Registrations { get; }
        ICourseUploadsRepository CourseUploads { get; }
        ISemesterRepository Semesters { get; }
        IUserStudyYearRepository UserStudyYears { get; }

        Task<int> SaveChangesAsync();

        IGenericRepository<TEntity, TKey> GetRepository<TEntity, TKey>() where TEntity : BaseEntities<TKey>;
    }
}
