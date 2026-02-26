using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.UserStudyYearDtos
{
    public class UserStudyYearDetailsDto
    {
        public int UserStudyYearId { get; set; }
        public int StartYear { get; set; }
        public int EndYear { get; set; }
        public Levels Level { get; set; }
        public string LevelName => Level.ToString().Replace("_", " ");
        public bool IsActive { get; set; }
        public bool IsCurrent { get; set; }
        public DateTime EnrolledAt { get; set; }
    }
}
