using AYA_UIS.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AYA_UIS.Infrastructure.Presistence.Data.Configurations
{
    public class StudyYearConfiguration : IEntityTypeConfiguration<StudyYear>
    {
        public void Configure(EntityTypeBuilder<StudyYear> builder)
        {
            builder.HasKey(s => s.Id);
        }
    }
}