using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;
using AYA_UIS.Domain.Entities;
using AYA_UIS.Domain.Entities.Identity;

namespace AYA_UIS.Domain.Entities.Models
{
    public class Registration : BaseEntities<int>
    {
        public RegistrationStatus Status { get; set; }
        public CourseProgress Progress { get; set; }
        public string? Reason { get; set; } // the reason for pending or canceling the registration
        public Grades? Grade { get; set; } // null if the course is not yet completed, otherwise it holds the grade received
        public bool IsPassed { get; set; } // This property indicates whether the course has been passed by the student or not. It can be used to determine if the student has met the prerequisites for other courses. 
        public string UserId { get; set; } = string.Empty;
        public User User { get; set; } = null!;
        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;
        public int StudyYearId { get; set; }
        public StudyYear StudyYear { get; set; } = null!;
        public int SemesterId { get; set; }
        public Semester Semester { get; set; } = null!;
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
    }
}