using AYA_UIS.Application.Commands.Departments;
using AutoMapper;
using AYA_UIS.Domain.Entities.Models;
using MediatR;
using Shared.Respones;
using AYA_UIS.Application.Dtos.DepartmentDtos;
using AYA_UIS.Domain.Contracts;

namespace AYA_UIS.Application.Handlers.Departments
{
    public class CreateDepartmentCommandHandler : IRequestHandler<CreateDepartmentCommand, Response<DepartmentDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CreateDepartmentCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Response<DepartmentDto>> Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
        {
            var department = _mapper.Map<Department>(request.Department);

            await _unitOfWork.Departments.AddAsync(department);
            await _unitOfWork.SaveChangesAsync();

            var result = _mapper.Map<DepartmentDto>(department);
            return Response<DepartmentDto>.SuccessResponse(result);
        }
    }
}