using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.AspNetCore.Identity;
using AYA_UIS.Domain.Entities.Identity;

namespace Presistence.Identity.Configurations
{
       public class UserConfiguration : IEntityTypeConfiguration<User>
       {
              public void Configure(EntityTypeBuilder<User> builder)
              {
                     builder.HasKey(u => u.Id);

                     builder.HasOne(u => u.Department)
                            .WithMany(d => d.Users)
                            .HasForeignKey(u => u.DepartmentId)
                            .IsRequired(false)
                            .OnDelete(DeleteBehavior.Restrict);

                     builder.HasMany(u => u.Registrations)
                            .WithOne(r => r.User)
                            .HasForeignKey(r => r.UserId)
                            .OnDelete(DeleteBehavior.Cascade);

                     builder.HasMany(u => u.UserStudyYears)
                            .WithOne(usy => usy.User)
                            .HasForeignKey(usy => usy.UserId)
                            .OnDelete(DeleteBehavior.Cascade);

                     builder.HasMany(u => u.SemesterGPAs)
                            .WithOne(g => g.User)
                            .HasForeignKey(g => g.UserId)
                            .OnDelete(DeleteBehavior.Cascade);

                     builder.HasMany(u => u.CourseUpload)
                            .WithOne(cu => cu.UploadedBy)
                            .HasForeignKey(cu => cu.UploadedByUserId)
                            .OnDelete(DeleteBehavior.Cascade);

                     builder.Property(u => u.TotalGPA)
                            .HasPrecision(18, 2);  // 18 total digits, 2 decimal places

              }
       }
}