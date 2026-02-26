using AYA_UIS.Application.Dtos.DepartmentDtos;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Commands.Departments
{
    public class UpdateDeparmentCommand : IRequest<Response<DepartmentDto>>
    {        
        public int Id { get; set; }
        public UpdateDepartmentDto Department { get; set; }

        public UpdateDeparmentCommand(int id, UpdateDepartmentDto department)
        {
            Id = id;
            Department = department;
        }
    }
}