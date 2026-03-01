using AYA_UIS.Domain.Entities.Identity;
using AYA_UIS.Domain.Entities.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Presistence;
using AYA_UIS.Domain.Enums;
using AYA_UIS.Infrastructure.Presistence;
using AYA_UIS.Domain.Contracts;

public class DataSeeding : IDataSeeding
{
    private readonly UniversityDbContext _dbContext;
    private readonly RoleManager<Role> _roleManager;
    private readonly UserManager<User> _userManager;

    public DataSeeding(
        UniversityDbContext dbContext,
        RoleManager<Role> roleManager,
        UserManager<User> userManager)
    {
        _dbContext = dbContext;
        _roleManager = roleManager;
        _userManager = userManager;
    }

    public async Task SeedDataInfoAsync()
    {
        try
        {
            var pendingMigration = await _dbContext.Database.GetPendingMigrationsAsync();
            if (pendingMigration.Any())
                await _dbContext.Database.MigrateAsync();


            // ================= Departments =================
            if (!_dbContext.Departments.Any())
            {
                var departments = new List<Department>
                {
                    new() { Name = "Computer Science", Code = "CS" },
                    new() { Name = "Business English", Code = "BE" },
                    new() { Name = "Business Arabic", Code = "BA" },
                    new() { Name = "Journalism", Code = "JR" },
                    new() { Name = "Engineering", Code = "ENG", HasPreparatoryYear = true }
                };

                await _dbContext.Departments.AddRangeAsync(departments);
                await _dbContext.SaveChangesAsync();
            }

            // ================= Study Years (global, not per-department) =================
            if (!_dbContext.StudyYears.Any())
            {
                var studyYears = new List<StudyYear>();

                // Seed global calendar study years from 2018-2019 up to 2025-2026
                for (int year = 2018; year <= 2025; year++)
                {
                    studyYears.Add(new StudyYear
                    {
                        StartYear = year,
                        EndYear = year + 1,
                        IsCurrent = year == 2025 // mark 2025-2026 as current
                    });
                }

                await _dbContext.StudyYears.AddRangeAsync(studyYears);
                await _dbContext.SaveChangesAsync();
            }

            // ================= Semesters =================
            if (!_dbContext.Semesters.Any())
            {
                var allStudyYears = await _dbContext.StudyYears.ToListAsync();
                var semesters = new List<Semester>();

                foreach (var studyYear in allStudyYears)
                {
                    // Semester1 (Fall) — Sep to Dec of StartYear
                    semesters.Add(new Semester
                    {
                        Title = SemesterEnum.First_Semester,
                        StartDate = new DateTime(studyYear.StartYear, 9, 1),
                        EndDate = new DateTime(studyYear.StartYear, 12, 31),
                        StudyYearId = studyYear.Id
                    });

                    // Semester2 (Spring) — Jan to May of EndYear
                    semesters.Add(new Semester
                    {
                        Title = SemesterEnum.Second_Semester,
                        StartDate = new DateTime(studyYear.EndYear, 1, 1),
                        EndDate = new DateTime(studyYear.EndYear, 5, 31),
                        StudyYearId = studyYear.Id
                    });
                }

                await _dbContext.Semesters.AddRangeAsync(semesters);
                await _dbContext.SaveChangesAsync();
            }

            // ================= Courses =================
            if (!_dbContext.Courses.Any())
            {
                var csDepartment = await _dbContext.Departments.FirstOrDefaultAsync(d => d.Code == "CS");
                if (csDepartment != null)
                {
                    var courses = new List<Course>
                    {
                        // Year 1
                        new Course { Code = "CS101", Name = "Introduction to Computer Science", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS102", Name = "Programming Fundamentals I", Credits = 4, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS103", Name = "Programming Fundamentals II", Credits = 4, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS104", Name = "Computer Organization", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "MATH101", Name = "Discrete Mathematics", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "MATH102", Name = "Calculus I", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "ENG101", Name = "English Communication", Credits = 2, DepartmentId = csDepartment.Id },
                        new Course { Code = "PHY101", Name = "Physics I", Credits = 3, DepartmentId = csDepartment.Id },

                        // Year 2
                        new Course { Code = "CS201", Name = "Data Structures", Credits = 4, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS202", Name = "Algorithms", Credits = 4, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS203", Name = "Object-Oriented Programming", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS204", Name = "Database Systems", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS205", Name = "Web Development", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "MATH201", Name = "Linear Algebra", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "STAT201", Name = "Statistics", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "ENG201", Name = "Technical Writing", Credits = 2, DepartmentId = csDepartment.Id },

                        // Year 3
                        new Course { Code = "CS301", Name = "Software Engineering", Credits = 4, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS302", Name = "Operating Systems", Credits = 4, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS303", Name = "Computer Networks", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS304", Name = "Artificial Intelligence", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS305", Name = "Machine Learning", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS306", Name = "Cybersecurity", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS307", Name = "Mobile App Development", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "MATH301", Name = "Numerical Methods", Credits = 3, DepartmentId = csDepartment.Id },

                        // Year 4
                        new Course { Code = "CS401", Name = "Advanced Algorithms", Credits = 4, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS402", Name = "Distributed Systems", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS403", Name = "Computer Graphics", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS404", Name = "Big Data Analytics", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS405", Name = "Cloud Computing", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS406", Name = "Blockchain Technology", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS407", Name = "IoT and Embedded Systems", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS408", Name = "Capstone Project I", Credits = 4, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS409", Name = "Capstone Project II", Credits = 4, DepartmentId = csDepartment.Id },
                        new Course { Code = "BUS401", Name = "Entrepreneurship", Credits = 2, DepartmentId = csDepartment.Id },

                        // Elective Courses
                        new Course { Code = "CS501", Name = "Advanced Machine Learning", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS502", Name = "Deep Learning", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS503", Name = "Natural Language Processing", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS504", Name = "Computer Vision", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS505", Name = "Quantum Computing", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS506", Name = "Game Development", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS507", Name = "DevOps", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS508", Name = "Ethical Hacking", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS509", Name = "Data Mining", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS510", Name = "Parallel Computing", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS511", Name = "Compiler Design", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS512", Name = "Human-Computer Interaction", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS513", Name = "Software Testing", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS514", Name = "Cryptography", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS515", Name = "Augmented Reality", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS516", Name = "Virtual Reality", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS517", Name = "Bioinformatics", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS518", Name = "Robotics", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS519", Name = "Digital Signal Processing", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS520", Name = "Information Retrieval", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS521", Name = "Network Security", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS522", Name = "Advanced Databases", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS523", Name = "Microservices Architecture", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS524", Name = "Serverless Computing", Credits = 3, DepartmentId = csDepartment.Id },
                        new Course { Code = "CS525", Name = "Edge Computing", Credits = 3, DepartmentId = csDepartment.Id }
                    };

                    await _dbContext.Courses.AddRangeAsync(courses);
                    await _dbContext.SaveChangesAsync();
                }
            }

            // ================= Course Prerequisites =================
            if (!_dbContext.CoursePrerequisites.Any())
            {
                var csDepartment = await _dbContext.Departments.FirstOrDefaultAsync(d => d.Code == "CS");
                if (csDepartment != null)
                {
                    var courses = await _dbContext.Courses.Where(c => c.DepartmentId == csDepartment.Id).ToDictionaryAsync(c => c.Code, c => c.Id);
                    
                    var prerequisites = new List<CoursePrerequisite>();
                    
                    // Only add prerequisites for courses that exist in the database
                    var prerequisiteDefinitions = new[]
                    {
                        new { CourseCode = "CS103", PrereqCode = "CS102" },
                        new { CourseCode = "CS201", PrereqCode = "CS103" },
                        new { CourseCode = "CS202", PrereqCode = "CS201" },
                        new { CourseCode = "CS203", PrereqCode = "CS102" },
                        new { CourseCode = "CS204", PrereqCode = "CS103" },
                        new { CourseCode = "CS401", PrereqCode = "CS202" },
                        new { CourseCode = "CS301", PrereqCode = "CS201" },
                        new { CourseCode = "CS302", PrereqCode = "CS201" },
                        new { CourseCode = "CS303", PrereqCode = "CS201" },
                        new { CourseCode = "CS304", PrereqCode = "CS201" },
                        new { CourseCode = "CS305", PrereqCode = "CS304" },
                        new { CourseCode = "CS306", PrereqCode = "CS201" },
                        new { CourseCode = "CS408", PrereqCode = "CS301" },
                        new { CourseCode = "CS408", PrereqCode = "CS302" },
                        new { CourseCode = "CS409", PrereqCode = "CS408" },
                        new { CourseCode = "CS501", PrereqCode = "CS305" },
                        new { CourseCode = "CS502", PrereqCode = "CS501" },
                        new { CourseCode = "CS503", PrereqCode = "CS305" },
                        new { CourseCode = "CS504", PrereqCode = "CS305" },
                        new { CourseCode = "CS508", PrereqCode = "CS306" },
                        new { CourseCode = "CS521", PrereqCode = "CS306" },
                        new { CourseCode = "CS522", PrereqCode = "CS204" }
                    };

                    foreach (var prereq in prerequisiteDefinitions)
                    {
                        if (courses.ContainsKey(prereq.CourseCode) && courses.ContainsKey(prereq.PrereqCode))
                        {
                            prerequisites.Add(new CoursePrerequisite 
                            { 
                                CourseId = courses[prereq.CourseCode], 
                                PrerequisiteCourseId = courses[prereq.PrereqCode] 
                            });
                        }
                    }

                    if (prerequisites.Any())
                    {
                        await _dbContext.CoursePrerequisites.AddRangeAsync(prerequisites);
                        await _dbContext.SaveChangesAsync();
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Seeder Error: " + ex.Message);
            throw; // optional: عشان يظهر full exception
        }
    }

    public async Task SeedIdentityDataAsync()
    {
        // Ensure database is migrated
        var pendingMigrations = await _dbContext.Database.GetPendingMigrationsAsync();
        if (pendingMigrations.Any())
            await _dbContext.Database.MigrateAsync();

        // Seed roles
        string[] roleNames = { "Admin", "Instructor", "Student" };
        foreach (var roleName in roleNames)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                var role = new Role { Name = roleName };
                await _roleManager.CreateAsync(role);
            }
        }

        // Seed admin user if no users exist
        if (!_userManager.Users.Any())
        {
            var adminUser = new User()
            {
                DisplayName = "Admin User",
                Email = "admin@akhbaracademy.com",
                UserName = "Admin123",
                PhoneNumber = "0123456789",
                AcademicCode = "220500",
                Level = null,
                Specialization = null,
                TotalCredits = null,
                DepartmentId = null,
                AllowedCredits = null,
            };
            
            var result = await _userManager.CreateAsync(adminUser, "Admin@123");
            
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }
    }
}
