using AYA_UIS.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Presistence.Data.Configurations
{
    public class SemesterGPAConfiguration : IEntityTypeConfiguration<SemesterGPA>
    {
        public void Configure(EntityTypeBuilder<SemesterGPA> builder)
        {
            builder.HasKey(g => g.Id);

            // Unique constraint: one GPA record per student per semester per study year
            builder.HasIndex(g => new { g.UserId, g.SemesterId, g.StudyYearId })
                   .IsUnique();

            builder.Property(g => g.UserId)
                   .IsRequired()
                   .HasMaxLength(450);

            builder.Property(g => g.GPA)
                   .HasPrecision(4, 2); // e.g., 4.00

            builder.HasOne(g => g.Semester)
                   .WithMany(s => s.SemesterGPAs)
                   .HasForeignKey(g => g.SemesterId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(g => g.StudyYear)
                   .WithMany(sy => sy.SemesterGPAs)
                   .HasForeignKey(g => g.StudyYearId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
