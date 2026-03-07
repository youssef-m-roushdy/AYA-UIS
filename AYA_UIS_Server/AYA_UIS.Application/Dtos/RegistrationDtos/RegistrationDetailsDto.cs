using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.CourseDtos;
using AYA_UIS.Application.Dtos.SemesterDtos;
using AYA_UIS.Application.Dtos.StudyYearDtos;
using AYA_UIS.Application.Dtos.UserDtos;
using AYA_UIS.Domain.Entities.Models;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.RegistrationDtos
{
    public class RegistrationDetailsDto
    {
        public int Id { get; set; }
        public RegistrationStatus Status { get; set; }
        public string? Reason { get; set; }
        public Grades? Grade { get; set; }
        public CourseDto Course { get; set; } = null!;
        public StudyYearDto StudyYearDto { get; set; } = null!;
        public SemesterDto Semester { get; set; } = null!;
        public UserDto User { get; set; } = null!;
        public CourseDto CourseDto { get; set; } = null!;
        public DateTime RegisteredAt { get; set; }
    }
}