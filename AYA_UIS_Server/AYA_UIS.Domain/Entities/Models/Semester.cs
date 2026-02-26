using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Entities;
using AYA_UIS.Domain.Entities.Models;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Domain.Entities.Models
{
    public class Semester : BaseEntities<int>
    {
        public SemesterEnum Title { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public int StudyYearId { get; set; }
        public StudyYear StudyYear { get; set; } = null!;
        public ICollection<AcademicSchedule> AcademicSchedules { get; set; } = new List<AcademicSchedule>();
        public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
        public ICollection<SemesterGPA> SemesterGPAs { get; set; } = new List<SemesterGPA>();
    }
}