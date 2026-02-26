using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.UserStudyYearDtos
{
    /// <summary>
    /// Full timeline of a user's study years from enrollment to graduation.
    /// </summary>
    public class UserStudyYearTimelineDto
    {
        public string UserId { get; set; } = string.Empty;
        public Levels CurrentLevel { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int? CurrentStudyYearId { get; set; }
        public int? CurrentStartYear { get; set; }
        public int? CurrentEndYear { get; set; }
        public int TotalYearsCompleted { get; set; }
        public bool IsGraduated { get; set; }
        public List<UserStudyYearDetailsDto> StudyYears { get; set; } = new();
    }
}
