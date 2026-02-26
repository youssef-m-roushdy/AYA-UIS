using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AYA_UIS.Application.Dtos.CourseUploadDtos
{
    public class CourseUploadDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // e.g., "sheet", "sheet answer", "material", etc.
        public string Url { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
        public string UploadedBy { get; set; } = string.Empty; // Display name of the uploader
    }
}