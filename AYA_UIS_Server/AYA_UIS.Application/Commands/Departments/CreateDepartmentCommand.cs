using AYA_UIS.Application.Dtos.DepartmentDtos;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Commands.Departments
{
    public class CreateDepartmentCommand : IRequest<Response<DepartmentDto>>
    {
        public CreateDepartmentDto Department { get; set; }

        public CreateDepartmentCommand(CreateDepartmentDto department)
        {
            Department = department;
        }
    }
}