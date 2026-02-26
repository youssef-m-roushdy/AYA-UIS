using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Entities;
using AYA_UIS.Domain.Entities.Identity;
using AYA_UIS.Domain.Entities.Models;

namespace AYA_UIS.Domain.Entities.Models
{
    public class CourseUpload : BaseEntities<int>
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // e.g., "sheet", "sheet answer", "material", etc.
        public string FileId { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string UploadedByUserId { get; set; } = string.Empty;
        public User UploadedBy { get; set; } = null!;
        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}