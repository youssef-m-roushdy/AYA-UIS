using System;
using AYA_UIS.Domain.Entities.Identity;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Domain.Entities.Models
{
    /// <summary>
    /// Tracks a user's enrollment in a specific study year, recording which academic level
    /// they were at during that year. This provides a full history from enrollment to graduation.
    /// </summary>
    public class UserStudyYear : BaseEntities<int>
    {
        // This entity represents a user's enrollment in a specific study year, tracking their academic level and status during that year.
        // so it can prevent issues like registering for courses in the wrong study year or semester, and allows us to maintain a full history of the user's academic journey.
        public bool IsActive { get; set; }
        public string UserId { get; set; } = string.Empty;
        public User User { get; set; } = null!;

        public int StudyYearId { get; set; }
        public StudyYear StudyYear { get; set; } = null!;

        public Levels Level { get; set; } // The academic level of the student in this study year
        // remove IsCurrent must be in study year entity only indicates that this is the crrently working study year
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    }
}
