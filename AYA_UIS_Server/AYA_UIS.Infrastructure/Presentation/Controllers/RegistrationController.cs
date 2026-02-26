using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AYA_UIS.Application.Commands.Registrations;
using AYA_UIS.Application.Dtos.RegistrationDtos;
using AYA_UIS.Application.Queries.Registrations;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AYA_UIS.Infrastructure.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RegistrationController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RegistrationController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> RegisterForCourse(CreateRegistrationDto registrationDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var command = new CreateRegistrationCommand(registrationDto, userId);
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRegistration(int id, UpdateRegistrationDto updateDto)
        {
            await _mediator.Send(new UpdateRegistrationCommand(id, updateDto));
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRegistration(int id)
        {            
            await _mediator.Send(new DeleteRegistrationCommand(id));
            return NoContent();
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetRegisteredCourses()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _mediator.Send(new GetRegisteredCoursesQuery(userId));
            return Ok(result);
        }

        [Authorize]
        [HttpGet("{studyYearId}/year")]
        public async Task<IActionResult> GetRegisteredYearCourses(int studyYearId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _mediator.Send(new GetRegisteredYearCoursesQuery(userId, studyYearId));
            return Ok(result);
        }

        [Authorize]
        [HttpGet("{studyYearId}/year/{semesterId}/semester")]
        public async Task<IActionResult> GetRegisteredSemesterCourses(int studyYearId, int semesterId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _mediator.Send(new GetRegisteredSemesterCoursesQuery(studyYearId, semesterId, userId));
            return Ok(result);
        }
    }
}