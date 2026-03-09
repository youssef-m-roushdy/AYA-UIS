using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Domain.Entities.Models
{
    public class SpecializationCourse : BaseEntities<int>
    {
        public SpecializationCourseRole Role { get; set; } // define if the course is core or specialization core or elective for the specialization
        public int SpecializationId { get; set; }
        public Specialization Specialization { get; set; } = null!;
        public int CourseId { get; set; }      
        public Course Course { get; set; } = null!;
    }
}