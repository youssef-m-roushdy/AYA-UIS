using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AYA_UIS.Domain.Entities.Identity;

namespace AYA_UIS.Domain.Entities.Models
{
    // Represents the academic schedule for a specific semester and academic year, associated with a department.
    public class AcademicSchedule : BaseEntities<int>
    {
        public string Title { get; set; } = string.Empty;
        public string FileId { get; set; } = string.Empty; // for cloud storage reference
        public string Url { get; set; } = string.Empty; // URL to access the file, can be generated from FileId
        public string? Description { get; set; }
        public int DepartmentId { get; set; }
        public Department Department { get; set; } = null!;
        public string UploadedByUserId { get; set; } = string.Empty;
        public User UploadedBy { get; set; } = null!;
        public int SemesterId { get; set; } // Foreign key to Semester
        public Semester Semester { get; set; } = null!; // semester for which this schedule is relevant (lectures, finals, etc.)
        public int StudyYearId { get; set; } // Foreign key to StudyYear
        public StudyYear StudyYear { get; set; } = null!; // 2023-2024, 2024-2025, etc.
        public DateTime ScheduleDate { get; set; } // Date when the schedule is effective or published
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
