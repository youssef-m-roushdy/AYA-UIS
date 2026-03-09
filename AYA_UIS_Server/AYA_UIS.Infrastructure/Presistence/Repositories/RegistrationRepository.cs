using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Models;
using AYA_UIS.Domain.Enums;
using AYA_UIS.Domain.Queries;
using AYA_UIS.Infrastructure.Presistence.Extensions;
using Microsoft.AspNetCore.SignalR.Protocol;
using Microsoft.EntityFrameworkCore;

namespace AYA_UIS.Infrastructure.Presistence.Repositories
{
    public class RegistrationRepository : GenericRepository<Registration, int>, IRegistrationRepository
    {
        public RegistrationRepository(UniversityDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<IEnumerable<Registration>> GetByUserIdAsync(string userId)
        {
            return await _dbContext.Registrations
                .Where(r => r.UserId == userId)
                .Include(r => r.Course)
                .Include(r => r.StudyYear)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Registration>> GetByCourseIdAsync(int courseId)
        {
            return await _dbContext.Registrations
                .Where(r => r.CourseId == courseId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Registration?> GetByUserAndCourseAsync(string userId, int courseId, int studyYearId)
        {
            return await _dbContext.Registrations
                .FirstOrDefaultAsync(r => r.UserId == userId && r.CourseId == courseId && r.StudyYearId == studyYearId);
        }

        public async Task<bool> IsUserRegisteredInCourseAsync(string userId, int courseId)
        {
            return await _dbContext.Registrations
                .AnyAsync(r => r.UserId == userId && r.CourseId == courseId);
        }

        public async Task<bool> IsCourseCompletedByUserAsync(string userId, int courseId)
        {
            return await _dbContext.Registrations
                .AnyAsync(r => r.UserId == userId && r.CourseId == courseId && r.IsPassed && r.Progress == CourseProgress.Completed);
        }

        public async Task<IEnumerable<Registration>> GetByUserAndStudyYearAsync(string userId, int studyYearId)
        {
            return await _dbContext.Registrations
                .Where(r => r.UserId == userId && r.StudyYearId == studyYearId)
                .Include(r => r.Course)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Registration>> GetByUserAndStudyYearAndSemseterAsync(string userId, int studyYearId, int semesterId)
        {
            return await _dbContext.Registrations
                .Where(r => r.UserId == userId && r.StudyYearId == studyYearId && r.SemesterId == semesterId)
                .Include(r => r.Course)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Registration>> GetByUserAsync(string userId, int? studyYearId = null)
        {
            var query = _dbContext.Registrations
                .Where(r => r.UserId == userId)
                .Include(r => r.Course)
                .Include(r => r.StudyYear)
                .Include(r => r.Semester)
                .AsNoTracking();

            if (studyYearId.HasValue)
                query = query.Where(r => r.StudyYearId == studyYearId.Value);

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<Registration>> GetAllAsync(int? courseId = null, int? studyYearId = null, int? semesterId = null, string? userId = null)
        {
            var query = _dbContext.Registrations
                .Include(r => r.Course)
                .Include(r => r.StudyYear)
                .Include(r => r.Semester)
                .Include(r => r.User)
                .AsNoTracking();

            if (courseId.HasValue)
                query = query.Where(r => r.CourseId == courseId.Value);
            if (studyYearId.HasValue)
                query = query.Where(r => r.StudyYearId == studyYearId.Value);
            if (semesterId.HasValue)
                query = query.Where(r => r.SemesterId == semesterId.Value);
            if (!string.IsNullOrEmpty(userId))
                query = query.Where(r => r.UserId == userId);

            return await query.ToListAsync();
        }

        public async Task<(IEnumerable<Registration> Data, int TotalCount)> GetAllSemesterRegistrationsPaginatedAsync(
            int semesterId,
            int studyYearId,
            RegistrationQuery? registrationQuery,
            CancellationToken cancellationToken)
        {
            // ✅ Guarantee non-null for the rest of the method
            registrationQuery ??= new RegistrationQuery();

            var query = _dbContext.Registrations
                .Where(r => r.SemesterId == semesterId && r.StudyYearId == studyYearId)
                .Include(r => r.Course)
                .Include(r => r.User)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrEmpty(registrationQuery.StudentUserName))
                query = query.Where(r => r.User.UserName.Contains(registrationQuery.StudentUserName));
            if (!string.IsNullOrEmpty(registrationQuery.CourseName))
                query = query.Where(r => r.Course.Name.Contains(registrationQuery.CourseName));
            if (!string.IsNullOrEmpty(registrationQuery.AcademicCode))
                query = query.Where(r => r.User.AcademicCode.Contains(registrationQuery.AcademicCode));
            if (!string.IsNullOrEmpty(registrationQuery.CourseCode))
                query = query.Where(r => r.Course.Code.Contains(registrationQuery.CourseCode));
            if (registrationQuery.Status.HasValue)
                query = query.Where(r => r.Status == registrationQuery.Status.Value);
            if (registrationQuery.IsPassed.HasValue)
                query = query.Where(r => r.IsPassed == registrationQuery.IsPassed.Value);
            if (registrationQuery.Progress.HasValue)
                query = query.Where(r => r.Progress == registrationQuery.Progress.Value);
            if (registrationQuery.Grade.HasValue)
                query = query.Where(r => r.Grade == registrationQuery.Grade.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            query = query.ApplyPagination(registrationQuery); // ✅ never null now

            var result = await query.ToListAsync(cancellationToken);

            return (result, totalCount);
        }

        public async Task<IEnumerable<Registration>> GetStudentPassedCoursesAsync(string userId)
        {
            return await _dbContext.Registrations
                .Where(r => r.UserId == userId && r.IsPassed)
                .Include(r => r.Course)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Registration>> GetStudentSemesterRegistrationCoursesAsync(
            string userId, int studyYearId, int semesterId)
        {
            return await _dbContext.Registrations
                .Where(r => r.UserId == userId
                         && r.StudyYearId == studyYearId
                         && r.SemesterId == semesterId
                        )
                .Include(r => r.Course)
                .AsNoTracking()
                .ToListAsync();
        }


    }
}
