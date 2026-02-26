using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.UserStudyYearDtos
{
    public class UserStudyYearDetailsDto
    {
        public int UserStudyYearId { get; set; }
        public int StartYear { get; set; } // e.g., 2024, 2025, etc.
        public int EndYear { get; set; } // e.g., 2025, 
        public bool IsCurrent { get; set; } // Indicates if this is the current study year
        public bool IsActive { get; set; }
        public Levels Level { get; set; } // The academic level of the student in this study year
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    }
}