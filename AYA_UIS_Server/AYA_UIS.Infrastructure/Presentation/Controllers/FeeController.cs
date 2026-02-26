using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Commands.Fees;
using AYA_UIS.Application.Dtos.DepartmentDtos.FeeDtos;
using AYA_UIS.Application.Queries.Fees;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AYA_UIS.Infrastructure.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeeController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FeeController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateFee([FromBody] CreateFeeDto feeDto)
        {
            var command = new CreateFeeCommand(feeDto);
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        //Get department fees for the current study year to show them to students when they want to register for courses and see the fees they have to pay for the current study year
        [Authorize(Roles = "Admin,Student")]
        [HttpGet("department/{departmentId}/study-year/{studyYearId}")]
        public async Task<IActionResult> GetFeesByDepartment(int departmentId, int studyYearId)
        {
            var query = new GetFeesOfDepartmentForStudyYearQuery(departmentId, studyYearId);
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        //get studdy year fees for admin to show them when he wants to add or edit fees for the current study year
        [Authorize(Roles = "Admin")]
        [HttpGet("study-year/{studyYearId}")]
        public async Task<IActionResult> GetFeesByStudyYear(int studyYearId)
        {
            var query = new GetFeesOfStudyYearQuery(studyYearId);
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFee(int id)
        {            var command = new DeleteFeeCommand(id);
            await _mediator.Send(command);
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFee(int id, [FromBody] UpdateFeeDto feeDto)
        {            
            var command = new UpdateFeeCommand(id, feeDto);
            await _mediator.Send(command);
            return NoContent();
        }   
    }
}