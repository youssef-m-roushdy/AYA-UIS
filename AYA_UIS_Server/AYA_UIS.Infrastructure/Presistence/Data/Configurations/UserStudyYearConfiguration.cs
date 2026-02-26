using AYA_UIS.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Presistence.Data.Configurations
{
    public class UserStudyYearConfiguration : IEntityTypeConfiguration<UserStudyYear>
    {
        public void Configure(EntityTypeBuilder<UserStudyYear> builder)
        {
            builder.HasKey(usy => usy.Id);

            // Unique constraint: one record per user per study year
            builder.HasIndex(usy => new { usy.UserId, usy.StudyYearId })
                   .IsUnique();

            builder.Property(usy => usy.UserId)
                   .IsRequired()
                   .HasMaxLength(450);

            builder.Property(usy => usy.Level)
                   .IsRequired();

            builder.HasOne(usy => usy.StudyYear)
                   .WithMany(sy => sy.UserStudyYears)
                   .HasForeignKey(usy => usy.StudyYearId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
