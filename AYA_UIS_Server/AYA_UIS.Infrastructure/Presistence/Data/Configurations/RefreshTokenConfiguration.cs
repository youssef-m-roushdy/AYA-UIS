using AYA_UIS.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AYA_UIS.Infrastructure.Presistence.Data.Configurations
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.HasKey(rt => rt.Id);

            builder.Property(rt => rt.Token)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(rt => rt.UserId)
                   .IsRequired()
                   .HasMaxLength(450);

            builder.HasIndex(rt => rt.Token)
                   .IsUnique();

            builder.HasIndex(rt => rt.UserId);

            builder.HasOne(rt => rt.User)
                   .WithMany(u => u.RefreshTokens)
                   .HasForeignKey(rt => rt.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Computed properties are not mapped to columns
            builder.Ignore(rt => rt.IsExpired);
            builder.Ignore(rt => rt.IsActive);
        }
    }
}
