using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Entities.Models;

namespace AYA_UIS.Domain.Entities.Models
{
    public class CoursePrerequisite
    {
        public int CourseId { get; set; } // The course that requires prerequisites
        public Course Course { get; set; } = null!;

        public int PrerequisiteCourseId { get; set; } // The course that is required
        public Course PrerequisiteCourse { get; set; } = null!;
    }
}