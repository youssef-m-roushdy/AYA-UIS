using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.UserDtos
{
    public class UpdateStudentLevelDto
    {
        public string? AcademicCode { get; set; }
        public Levels Level { get; set; }
    }
}