using AYA_UIS.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AYA_UIS.Infrastructure.Presistence.Data.Configurations
{
    public class CourseConfiguration : IEntityTypeConfiguration<Course>
    {
        public void Configure(EntityTypeBuilder<Course> builder)
        {
            builder.HasKey(c => c.Id);

            // Relationship to main Department
            builder.HasOne(c => c.Department)
                   .WithMany(d => d.Courses)
                   .HasForeignKey(c => c.DepartmentId)
                   .OnDelete(DeleteBehavior.Restrict);

            // DepartmentCourse (M:N)
            builder.HasMany(c => c.DepartmentCourses)
                   .WithOne(dc => dc.Course)
                   .HasForeignKey(dc => dc.CourseId)
                   .OnDelete(DeleteBehavior.Cascade);

            // SpecializationCourse (M:N)
            builder.HasMany(c => c.SpecializationCourses)
                   .WithOne(sc => sc.Course)
                   .HasForeignKey(sc => sc.CourseId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Optional: add indexes on FK columns for performance
            builder.HasIndex(c => c.DepartmentId);
        }
    }
}