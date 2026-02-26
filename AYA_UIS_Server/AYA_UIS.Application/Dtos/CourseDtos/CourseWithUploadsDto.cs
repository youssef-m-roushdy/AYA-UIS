using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.CourseUploadDtos;

namespace AYA_UIS.Application.Dtos.CourseDtos
{
    public class CourseWithUploadsDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int Credits { get; set; }
        public ICollection<CourseUploadDto> Uploads { get; set; } = new List<CourseUploadDto>();
    }
}
