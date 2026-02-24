using AYA_UIS.Application.Commands.Departments;
using AYA_UIS.Application.Queries.Departments;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Dtos.Info_Module.DepartmentDtos;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DepartmentsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Get all departments
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllDepartmentsQuery());
            return Ok(result);
        }

        /// <summary>
        /// Get department by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _mediator.Send(new GetDepartmentByIdQuery(id));
            return Ok(result);
        }

        /// <summary>
        /// Create a new department
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateDepartmentDto department)
        {
            var result = await _mediator.Send(new CreateDepartmentCommand { Department = department });
            return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
        }

        /// <summary>
        /// Update an existing department
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDepartmentDto department)
        {
            var result = await _mediator.Send(new UpdateDeparmentCommand(id, department));
            return Ok(result);
        }

        /// <summary>
        /// Delete a department
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _mediator.Send(new DeleteDepartmentCommand(id));
            return Ok(result);
        }
    }
}
