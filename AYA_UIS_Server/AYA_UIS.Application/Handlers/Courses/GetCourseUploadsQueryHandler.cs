using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.CourseDtos;
using AYA_UIS.Application.Dtos.CourseUploadDtos;
using AYA_UIS.Application.Queries.Courses;
using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Shared.Respones;

namespace AYA_UIS.Application.Handlers.Courses
{
    public class GetCourseUploadsQueryHandler : IRequestHandler<GetCourseUploadsQuery, Response<CourseWithUploadsDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<User> _userManager;

        public GetCourseUploadsQueryHandler(IUnitOfWork unitOfWork, UserManager<User> userManager)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
        }

        public async Task<Response<CourseWithUploadsDto>> Handle(GetCourseUploadsQuery request, CancellationToken cancellationToken)
        {
            var course = await _unitOfWork.Courses.GetCourseUplaodsAsync(request.CourseId);
            
            if (course is null)
                return Response<CourseWithUploadsDto>.ErrorResponse("Course not found");

            var userIds = course.CourseUpload.Select(u => u.UploadedByUserId).Distinct().ToList();
            var users = new Dictionary<string, string>();
            foreach (var userId in userIds)
            {
                var user = await _userManager.FindByIdAsync(userId);
                users[userId] = user?.DisplayName ?? "Unknown";
            }

            var result = new CourseWithUploadsDto
            {
                Id = course.Id,
                Code = course.Code,
                Name = course.Name,
                Credits = course.Credits,
                Uploads = course.CourseUpload.Select(u => new CourseUploadDto
                {
                    Id = u.Id,
                    Title = u.Title,
                    Description = u.Description,
                    Type = u.Type,
                    Url = u.Url,
                    UploadedAt = u.UploadedAt,
                    UploadedBy = users.GetValueOrDefault(u.UploadedByUserId, "Unknown")
                }).ToList()
            };

            return Response<CourseWithUploadsDto>.SuccessResponse(result);
        }
    }
}
