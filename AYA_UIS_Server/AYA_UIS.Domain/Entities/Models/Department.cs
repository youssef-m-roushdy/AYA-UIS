using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AYA_UIS.Domain.Entities.Identity;

namespace AYA_UIS.Domain.Entities.Models
{
    public class Department : BaseEntities<int>
    {

        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool HasPreparatoryYear { get; set; } = false;
        public ICollection<Course> Courses { get; set; } = new List<Course>(); // mean the department has multiple courses and the course belongs to one department that gets the main department courses
        public ICollection<Fee> Fees { get; set; } = new List<Fee>(); // mean the depratment has multiple fees for different levels and academic years
        public ICollection<AcademicSchedule> AcademicSchedules { get; set; } = new List<AcademicSchedule>();
        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<Specialization> Specializations { get; set; } = new List<Specialization>();
        // that get main deparmtment courses and plus the courses that are major or minor or elective for the department
        public ICollection<DepartmentCourse> DepartmentCourses { get; set; } = new List<DepartmentCourse>(); // many to many relationship between department and courses because the course can be major in one department and minor in another department or elective in another department
    }
}
