using AYA_UIS.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AYA_UIS.Infrastructure.Presistence.Data.Configurations
{
    public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
    {
        public void Configure(EntityTypeBuilder<Department> builder)
        {
            builder.HasKey(d => d.Id);

            // Properties
            builder.Property(d => d.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(d => d.Code)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.HasIndex(d => d.Code)
                   .IsUnique();

            // Relationships

            // Department → Courses (1:M)
            builder.HasMany(d => d.Courses)
                   .WithOne(c => c.Department)
                   .HasForeignKey(c => c.DepartmentId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Department → Specializations (1:M)
            builder.HasMany(d => d.Specializations)
                   .WithOne(s => s.Department)
                   .HasForeignKey(s => s.DepartmentId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Department → Users (1:M)
            builder.HasMany(d => d.Users)
                   .WithOne(u => u.Department)
                   .HasForeignKey(u => u.DepartmentId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Department → DepartmentCourses (M:N via join table)
            builder.HasMany(d => d.DepartmentCourses)
                   .WithOne(dc => dc.Department)
                   .HasForeignKey(dc => dc.DepartmentId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}