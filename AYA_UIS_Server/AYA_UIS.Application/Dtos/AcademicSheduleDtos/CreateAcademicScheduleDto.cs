using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace AYA_UIS.Application.Dtos.AcademicSheduleDtos
{
    public class CreateSemesterAcademicScheduleDto
    {
        public string Title { get; set; } = string.Empty;
        public IFormFile File { get; set; } = null!;
        public string? Description { get; set; }
    }
}