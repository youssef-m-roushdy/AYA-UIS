using AYA_UIS.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AYA_UIS.Infrastructure.Presistence.Data.Configurations
{
    public class SpecializationConfiguration : IEntityTypeConfiguration<Specialization>
    {
        public void Configure(EntityTypeBuilder<Specialization> builder)
        {
            builder.HasKey(s => s.Id);

            builder.Property(s => s.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(s => s.Description)
                   .HasMaxLength(500);

            // Ensure specialization names are unique within a department
            builder.HasIndex(s => new { s.DepartmentId, s.Name })
                   .IsUnique();

            // Specialization → Department (already configured from DepartmentConfiguration,
            // but explicitly set here for clarity)
            builder.HasOne(s => s.Department)
                   .WithMany(d => d.Specializations)
                   .HasForeignKey(s => s.DepartmentId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Specialization → Users (1:M)
            builder.HasMany(s => s.Users)
                   .WithOne(u => u.Specialization)
                   .HasForeignKey(u => u.SpecializationId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
