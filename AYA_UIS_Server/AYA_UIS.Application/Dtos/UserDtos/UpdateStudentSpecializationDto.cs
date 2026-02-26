using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AYA_UIS.Application.Dtos.UserDtos
{
    public class UpdateStudentSpecializationDto
    {
        public string? AcademicCode { get; set; }
        public string Specialization { get; set; }
    }
}