using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Contracts;
using AYA_UIS.Domain.Entities.Models;
using AYA_UIS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Presistence;

namespace AYA_UIS.Infrastructure.Presistence.Services
{
    public class GpaCalculationService : IGpaCalculationService
    {
        private readonly UniversityDbContext _dbContext;

        public GpaCalculationService(UniversityDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Get grade point value for a grade (4.0 scale)
        /// </summary>
        public decimal GetGradePoint(Grads grade)
        {
            return grade switch
            {
                Grads.A_Plus => 4.0m,
                Grads.A => 4.0m,
                Grads.A_Minus => 3.7m,
                Grads.B_Plus => 3.3m,
                Grads.B => 3.0m,
                Grads.B_Minus => 2.7m,
                Grads.C_Plus => 2.3m,
                Grads.C => 2.0m,
                Grads.C_Minus => 1.7m,
                Grads.D_Plus => 1.3m,
                Grads.D => 1.0m,
                Grads.D_Minus => 0.7m,
                Grads.F => 0.0m,
                _ => 0.0m
            };
        }

        /// <summary>
        /// Calculate GPA for a student in a specific semester and study year
        /// Formula: GPA = Σ(Grade Points × Course Credits) / Σ(Course Credits)
        /// </summary>
        public async Task<SemesterGPA?> CalculateAndSaveSemesterGPAAsync(string userId, int semesterId, int studyYearId)
        {
            try
            {
                // Get all registrations for this student in this semester and study year
                var registrations = await _dbContext.Registrations
                    .Where(r => r.UserId == userId && r.SemesterId == semesterId && r.StudyYearId == studyYearId)
                    .Include(r => r.Course)
                    .ToListAsync();

                if (!registrations.Any())
                {
                    return null; // No registrations found
                }

                // Calculate total credit hours and weighted grade points
                int totalCreditHours = 0;
                decimal totalWeightedPoints = 0;

                foreach (var registration in registrations)
                {
                    if (registration.Grade is null) continue;
                    decimal gradePoint = GetGradePoint(registration.Grade.Value);
                    int credits = registration.Course.Credits;
                    
                    totalWeightedPoints += gradePoint * credits;
                    totalCreditHours += credits;
                }

                // Calculate GPA
                decimal gpa = totalCreditHours > 0 ? (totalWeightedPoints / totalCreditHours) : 0;

                // Round to 2 decimal places
                gpa = Math.Round(gpa, 2);

                // Check if SemesterGPA already exists for this combination
                var existingGPA = await _dbContext.SemesterGPAs
                    .FirstOrDefaultAsync(g => g.UserId == userId && g.SemesterId == semesterId && g.StudyYearId == studyYearId);

                if (existingGPA != null)
                {
                    // Update existing record
                    existingGPA.GPA = gpa;
                    existingGPA.TotalCreditHours = totalCreditHours;
                    existingGPA.CalculatedAt = DateTime.UtcNow;
                    _dbContext.SemesterGPAs.Update(existingGPA);
                }
                else
                {
                    // Create new record
                    var semesterGPA = new SemesterGPA
                    {
                        UserId = userId,
                        SemesterId = semesterId,
                        StudyYearId = studyYearId,
                        GPA = gpa,
                        TotalCreditHours = totalCreditHours,
                        CalculatedAt = DateTime.UtcNow
                    };
                    
                    _dbContext.SemesterGPAs.Add(semesterGPA);
                }

                await _dbContext.SaveChangesAsync();

                // Return the updated or newly created record
                return await GetSemesterGPAAsync(userId, semesterId, studyYearId);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error calculating GPA for user {userId}: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Get GPA for a student in a specific semester and study year
        /// </summary>
        public async Task<SemesterGPA?> GetSemesterGPAAsync(string userId, int semesterId, int studyYearId)
        {
            return await _dbContext.SemesterGPAs
                .Include(g => g.Semester)
                .Include(g => g.StudyYear)
                .FirstOrDefaultAsync(g => g.UserId == userId && g.SemesterId == semesterId && g.StudyYearId == studyYearId);
        }

        /// <summary>
        /// Get all semester GPAs for a student
        /// </summary>
        public async Task<IEnumerable<SemesterGPA>> GetAllStudentGPAsAsync(string userId)
        {
            return await _dbContext.SemesterGPAs
                .Where(g => g.UserId == userId)
                .Include(g => g.Semester)
                .Include(g => g.StudyYear)
                .OrderBy(g => g.StudyYear.StartYear)
                .ThenBy(g => g.Semester.Title)
                .ToListAsync();
        }

        /// <summary>
        /// Calculate cumulative GPA for a student across all semesters
        /// Formula: Cumulative GPA = Σ(All Semester Weighted Points) / Σ(All Credit Hours)
        /// </summary>
        public async Task<decimal> CalculateCumulativeGPAAsync(string userId)
        {
            var semesterGPAs = await GetAllStudentGPAsAsync(userId);

            if (!semesterGPAs.Any())
            {
                return 0;
            }

            decimal totalWeightedPoints = 0;
            int totalCreditHours = 0;

            foreach (var semesterGPA in semesterGPAs)
            {
                totalWeightedPoints += semesterGPA.GPA * semesterGPA.TotalCreditHours;
                totalCreditHours += semesterGPA.TotalCreditHours;
            }

            decimal cumulativeGPA = totalCreditHours > 0 ? (totalWeightedPoints / totalCreditHours) : 0;
            return Math.Round(cumulativeGPA, 2);
        }
    }
}
