using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.CourseDtos;
using AYA_UIS.Application.Dtos.UserDtos;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.RegistrationDtos
{
    public class RegistrationDto
    {
        public int Id { get; set; }
        public RegistrationStatus Status { get; set; }
        public CourseProgress Progress { get; set; }
        public string? Reason { get; set; } // the reason for pending or canceling the registration
        public Grades? Grade { get; set; } // null if the course is not yet completed, otherwise it holds the grade received
        public bool IsPassed { get; set; } // This property indicates whether the course has been passed by the student or not. It can be used to determine if the student has met the prerequisites for other courses. 
        public UserDto User { get; set; } = null!;
        public CourseDto Course { get; set; } = null!;
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
    }
}