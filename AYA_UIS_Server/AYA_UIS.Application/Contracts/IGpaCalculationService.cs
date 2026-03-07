using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AYA_UIS.Domain.Entities.Models;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Contracts
{
    public interface IGpaCalculationService
    {
        /// <summary>
        /// Calculate GPA for a student in a specific semester and study year
        /// </summary>
        Task<SemesterGPA?> CalculateAndSaveSemesterGPAAsync(string userId, int semesterId, int studyYearId);

        /// <summary>
        /// Get GPA for a student in a specific semester and study year
        /// </summary>
        Task<SemesterGPA?> GetSemesterGPAAsync(string userId, int semesterId, int studyYearId);

        /// <summary>
        /// Get all semester GPAs for a student
        /// </summary>
        Task<IEnumerable<SemesterGPA>> GetAllStudentGPAsAsync(string userId);

        /// <summary>
        /// Calculate cumulative GPA for a student across all semesters
        /// </summary>
        Task<decimal> CalculateCumulativeGPAAsync(string userId);

        /// <summary>
        /// Convert grade enum to numeric point value (4.0 scale)
        /// </summary>
        decimal GetGradePoint(Grades grade);
    }
}
