using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AYA_UIS.Application.Dtos.StudyYearDtos
{
    public class StudyYearDto
    {
        public int Id { get; set; }
        public int StartYear { get; set; } // e.g., 2024, 2025, etc.
        public int EndYear { get; set; } // e.g., 2025, 
        public bool IsCurrent { get; set; } // Indicates if this is the current study year
    }
}