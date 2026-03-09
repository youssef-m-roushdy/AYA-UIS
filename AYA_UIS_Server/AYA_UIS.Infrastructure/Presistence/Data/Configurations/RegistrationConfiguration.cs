using AYA_UIS.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AYA_UIS.Infrastructure.Presistence.Data.Configurations
{
    public class RegistrationConfiguration : IEntityTypeConfiguration<Registration>
    {
        public void Configure(EntityTypeBuilder<Registration> builder)
        {
            builder.HasKey(r => r.Id);

            builder.Property(r => r.UserId)
                   .IsRequired()
                   .HasMaxLength(450);

            builder.HasOne(r => r.User)
                   .WithMany(u => u.Registrations)
                   .HasForeignKey(r => r.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(r => r.Course)
                   .WithMany(c => c.Registrations)
                   .HasForeignKey(r => r.CourseId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(r => r.StudyYear)
                   .WithMany(sy => sy.Registrations)
                   .HasForeignKey(r => r.StudyYearId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(r => r.Semester)
                   .WithMany(s => s.Registrations)
                   .HasForeignKey(r => r.SemesterId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}