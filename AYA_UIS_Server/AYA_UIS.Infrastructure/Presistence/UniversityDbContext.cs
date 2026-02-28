using System.Reflection;
using AYA_UIS.Domain.Entities.Identity;
using AYA_UIS.Domain.Entities.Models;
using AYA_UIS.Domain.Entities.Identity;
using AYA_UIS.Domain.Entities.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AYA_UIS.Infrastructure.Presistence
{
    public class UniversityDbContext : IdentityDbContext<User, Role, string,
    IdentityUserClaim<string>, UserRole, IdentityUserLogin<string>,
    IdentityRoleClaim<string>, IdentityUserToken<string>>
    {
        public UniversityDbContext(DbContextOptions<UniversityDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<UserRole>(userRole =>
            {
                userRole.HasKey(ur => new { ur.UserId, ur.RoleId });

                userRole.HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.RoleId);

                userRole.HasOne(ur => ur.User)
                    .WithMany(u => u.UserRoles)
                    .HasForeignKey(ur => ur.UserId);
            });

            builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            builder.Entity<User>()
                   .HasIndex(u => u.Academic_Code)
                   .IsUnique();
        }

        // Domain tables
        public DbSet<Department> Departments { get; set; }
        public DbSet<StudyYear> StudyYears { get; set; }
        public DbSet<Semester> Semesters { get; set; }
        public DbSet<AcademicSchedule> AcademicSchedules { get; set; }
        public DbSet<Fee> Fees { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<CoursePrerequisite> CoursePrerequisites { get; set; }
        public DbSet<Registration> Registrations { get; set; }
        public DbSet<CourseUpload> CourseUploads { get; set; }
        public DbSet<SemesterGPA> SemesterGPAs { get; set; }
        public DbSet<UserStudyYear> UserStudyYears { get; set; }
    }
}
