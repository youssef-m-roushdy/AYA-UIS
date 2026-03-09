using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AYA_UIS.Infrastructure.Presistence.Data.Configurations
{
    public class DepartmentCourseConfiguration : IEntityTypeConfiguration<DepartmentCourse>
    {
        public void Configure(EntityTypeBuilder<DepartmentCourse> builder)
        {
            builder.HasKey(dc => dc.Id);

            // Unique constraint: a course can appear only once per department
            builder.HasIndex(dc => new { dc.DepartmentId, dc.CourseId })
                   .IsUnique();

            // Relationships
            builder.HasOne(dc => dc.Department)
                   .WithMany(d => d.DepartmentCourses)
                   .HasForeignKey(dc => dc.DepartmentId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(dc => dc.Course)
                   .WithMany(c => c.DepartmentCourses)
                   .HasForeignKey(dc => dc.CourseId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Enum conversion (store as string)
            builder.Property(dc => dc.Role)
                   .HasConversion<string>()
                   .IsRequired();
        }
    }
}