using System.ComponentModel.DataAnnotations;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.UserStudyYearDtos
{
    public class CreateUserStudyYearDto
    {
        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public int StudyYearId { get; set; }

        [Required]
        public Levels Level { get; set; }
    }
}
