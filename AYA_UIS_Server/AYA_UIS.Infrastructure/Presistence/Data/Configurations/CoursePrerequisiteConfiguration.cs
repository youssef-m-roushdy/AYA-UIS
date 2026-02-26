using AYA_UIS.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Presistence.Data.Configurations
{
    public class CoursePrerequisiteConfiguration : IEntityTypeConfiguration<CoursePrerequisite>
    {
        public void Configure(EntityTypeBuilder<CoursePrerequisite> builder)
        {
            // Composite primary key
            builder.HasKey(cp => new { cp.CourseId, cp.PrerequisiteCourseId });

            builder.HasOne(cp => cp.Course)
                   .WithMany(c => c.PrerequisiteFor)
                   .HasForeignKey(cp => cp.CourseId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(cp => cp.PrerequisiteCourse)
                   .WithMany(c => c.DependentCourses)
                   .HasForeignKey(cp => cp.PrerequisiteCourseId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
