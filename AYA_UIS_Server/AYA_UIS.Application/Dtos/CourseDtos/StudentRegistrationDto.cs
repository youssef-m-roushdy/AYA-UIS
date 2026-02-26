using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AYA_UIS.Application.Dtos.CourseDtos
{
    public class StudentRegistrationDto
    {
        public string UserId { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string AcademicCode { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime RegisteredAt { get; set; }
    }
}
