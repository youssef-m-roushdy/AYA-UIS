using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.CourseDtos;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.RegistrationDtos
{
    public class RegistrationCourseDto
    {
        public int Id { get; set; }
        public RegistrationStatus Status { get; set; }
        public CourseProgress Progress { get; set; }
        public string? Reason { get; set; } // the reason for pending or canceling the registration
        public Grads Grade { get; set; } // null if the course is not yet completed, otherwise it holds the grade received
        public bool IsPassed { get; set; } // This property indicates whether the course has been passed
        public CourseDto Course { get; set; } = null!;
    }
}