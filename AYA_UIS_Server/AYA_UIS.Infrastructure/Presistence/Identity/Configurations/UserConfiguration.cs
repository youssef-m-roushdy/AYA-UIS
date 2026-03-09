using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AYA_UIS.Domain.Entities.Identity;
using AYA_UIS.Domain.Entities.Models;

namespace AYA_UIS.Infrastructure.Presistence.Identity.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);

            // Relationship to Department (optional)
            builder.HasOne(u => u.Department)
                   .WithMany(d => d.Users)
                   .HasForeignKey(u => u.DepartmentId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Restrict);

            // Relationship to Specialization (optional)
            builder.HasOne(u => u.Specialization)
                   .WithMany(s => s.Users)
                   .HasForeignKey(u => u.SpecializationId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Restrict);

            // Registrations
            builder.HasMany(u => u.Registrations)
                   .WithOne(r => r.User)
                   .HasForeignKey(r => r.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // UserStudyYears
            builder.HasMany(u => u.UserStudyYears)
                   .WithOne(usy => usy.User)
                   .HasForeignKey(usy => usy.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // SemesterGPAs
            builder.HasMany(u => u.SemesterGPAs)
                   .WithOne(g => g.User)
                   .HasForeignKey(g => g.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // CourseUploads
            builder.HasMany(u => u.CourseUpload)
                   .WithOne(cu => cu.UploadedBy)
                   .HasForeignKey(cu => cu.UploadedByUserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // UserRoles (Identity)
            builder.HasMany(u => u.UserRoles)
                   .WithOne(ur => ur.User)
                   .HasForeignKey(ur => ur.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // RefreshTokens
            builder.HasMany(u => u.RefreshTokens)
                   .WithOne(rt => rt.User)
                   .HasForeignKey(rt => rt.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // TotalGPA precision
            builder.Property(u => u.TotalGPA)
                   .HasPrecision(18, 2);

            // Unique index for AcademicCode
            builder.HasIndex(u => u.AcademicCode)
                   .IsUnique();
        }
    }
}