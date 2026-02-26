using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AYA_UIS.Application.Dtos.CourseUploadDtos
{
    public class CreateCourseUploadDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // e.g., "sheet", "sheet answer", "material", etc.
        public string UploadedByUserId { get; set; } = string.Empty;
        public int CourseId { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    }
}