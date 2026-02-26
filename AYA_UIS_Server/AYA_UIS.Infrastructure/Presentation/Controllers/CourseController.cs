using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AYA_UIS.Application.Commands.Courses;
using AYA_UIS.Application.Commands.CourseUploads;
using AYA_UIS.Application.Dtos.CourseDtos;
using AYA_UIS.Application.Dtos.CourseUploadDtos;
using AYA_UIS.Application.Queries.CoursePrequisites;
using AYA_UIS.Application.Queries.Courses;
using AYA_UIS.Application.Queries.Registrations;
using AYA_UIS.Domain.Enums;
using AYA_UIS.Domain.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AYA_UIS.Infrastructure.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseController : ControllerBase
    {

        private readonly IMediator _mediator;

        public CourseController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Add(CreateCourseDto courseDto)
        {
            var result = await _mediator.Send(new CreateCourseCommand(courseDto));
            //return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] CourseQuery query)
        {
            var result = await _mediator.Send(new GetAllCoursesQuery(query));
            //return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
            return Ok(result);
        }

        [HttpGet("{id}/uploads")]
        public async Task<IActionResult> GetCourseUploads(int id)
        {
            var result = await _mediator.Send(new GetCourseUploadsQuery(id));
            return Ok(result);
        }

        [HttpGet("{id}/registrations/{yearId}")]
        public async Task<IActionResult> GetCourseYearRegistrations(int id, int yearId)
        {
            var result = await _mediator.Send(new GetCourseYearRegistrationsQuery(id, yearId));
            return Ok(result);
        }

        [Authorize]
        [HttpPost("{courseId}/upload")]
        public async Task<IActionResult> UploadCourseFile(int courseId, [FromForm] string title, [FromForm] string description, [FromForm] string type, IFormFile file)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var command = new CreateCourseUploadCommand
            {
                CourseUploadDto = new CreateCourseUploadDto
                {
                    Title = title,
                    Description = description,
                    Type = type,
                    CourseId = courseId
                },
                File = file,
                UserId = userId
            };

            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("department/{departmentId}")]
        public async Task<IActionResult> DeparmentCourses(int departmentId, [FromQuery] DepartmentCourseQuery query)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _mediator.Send(new GetDepartmentCoursesQuery(departmentId, query));
            return Ok(result);
        }
     
        [Authorize]
        [HttpGet("prequisites/{courseId}")]
        public async Task<IActionResult> GetCoursePrequisites(int courseId)
        {
            var result = await _mediator.Send(new GetCoursePrequisitesQuery(courseId));
            return Ok(result);
        }

        [Authorize]
        [HttpGet("dependencies/{courseId}")]
        public async Task<IActionResult> GetCourseDependencies(int courseId)
        {
            var result = await _mediator.Send(new GetCourseDependenciesQuery(courseId));
            return Ok(result);
        }

        [Authorize]
        [HttpGet("open/department/{departmentId}")]
        public async Task<IActionResult> GetDepartmentOpenCourses(int departmentId)
        {
            var result = await _mediator.Send(new GetDepartmentOpenCoursesQuery(departmentId));
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("status")]
        public async Task<IActionResult> UpdateCourseStatus([FromBody] UpdateCourseStatusDto updateCourseStatusDto)
        {
            var result = await _mediator.Send(new UpdateCourseStatusCommand(updateCourseStatusDto));
            return Ok(result);
        }

    }
}