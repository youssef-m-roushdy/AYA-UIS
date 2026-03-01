using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Commands.UserStudyYears;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Identity;
using AYA_UIS.Domain.Enums;
using AYA_UIS.Domain.Entities.Models;

namespace AYA_UIS.Application.Handlers.UserStudyYears
{
    public class PromoteStudentCommandHandler : IRequestHandler<PromoteStudentCommand, Unit>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<User> _userManager;

        public PromoteStudentCommandHandler(IUnitOfWork unitOfWork, UserManager<User> userManager)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
        }

        public async Task<Unit> Handle(PromoteStudentCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.AcademicCode == request.AcademicCode);

            if (user == null)
                throw new Exception("User not found");

            if (user.Level == Levels.Graduate)
                throw new Exception("Student has already graduated");

            var currentStudyYear = await _unitOfWork.StudyYears.GetCurrentStudyYearAsync();

            if (currentStudyYear == null)
                throw new Exception("Current study year not found");

            var userStudyYear = await _unitOfWork.UserStudyYears.GetByUserAndStudyYearAsync(user.Id, currentStudyYear.Id);

            if (userStudyYear != null)
                throw new Exception("User is already assigned to the current study year");

            // Assign student to current study year with their existing level
            var newUserStudyYear = new UserStudyYear
            {
                UserId = user.Id,
                StudyYearId = currentStudyYear.Id,
                Level = user.Level.GetValueOrDefault(),
                EnrolledAt = DateTime.UtcNow
            };

            await _unitOfWork.UserStudyYears.AddRangeAsync(new List<UserStudyYear> { newUserStudyYear });
            await _unitOfWork.SaveChangesAsync();

            return Unit.Value;
        }
    }
}