using AYA_UIS.Application.Dtos.DepartmentDtos;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Queries.Departments
{
    public record GetDepartmentByIdQuery(int Id) : IRequest<Response<DepartmentDto>>;
}
