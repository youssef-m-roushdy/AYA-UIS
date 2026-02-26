using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AYA_UIS.Application.Dtos.AcademicSheduleDtos
{
    public class AcademicSchedulesDto
    {
        public int? Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Url { get; set; }
        public string? Description { get; set; }
    }
}