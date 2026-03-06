
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AYA_UIS.Application.Dtos.RegistrationDtos
{
    public class CreateRegistrationDto
    {
        public int CourseId { get; set; }
        public int StudyYearId { get; set; }
        public int SemesterId { get; set; }
    }
}