using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Domain.Entities.Models
{
    public class DepartmentCourse : BaseEntities<int>
    {
        public int DepartmentId { get; set; }
        public int CourseId { get; set; }

        // Navigation properties
        public Department Department { get; set; } = null!;
        public Course Course { get; set; } = null!;
        public CourseRole Role { get; set; } // define is the course is major or minor or elective for the department
    }
}