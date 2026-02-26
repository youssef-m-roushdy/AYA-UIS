using AYA_UIS.Application.Commands.Departments;
using AutoMapper;
using AYA_UIS.Shared.Exceptions;
using MediatR;
using Shared.Respones;
using AYA_UIS.Application.Dtos.DepartmentDtos;
using AYA_UIS.Domain.Contracts;

namespace AYA_UIS.Application.Handlers.Departments
{
    public class UpdateDepartmentCommandHandler : IRequestHandler<UpdateDeparmentCommand, Response<DepartmentDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UpdateDepartmentCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Response<DepartmentDto>> Handle(UpdateDeparmentCommand request, CancellationToken cancellationToken)
        {
            var department = await _unitOfWork.Departments.GetByIdAsync(request.Id);

            if (department is null)
                throw new NotFoundException($"Department with ID {request.Id} not found.");

            department.Name = request.Department.Name;
            department.Code = request.Department.Code;
            department.Description = request.Department.Description;

            await _unitOfWork.Departments.Update(department);
            await _unitOfWork.SaveChangesAsync();

            var result = _mapper.Map<DepartmentDto>(department);
            return Response<DepartmentDto>.SuccessResponse(result);
        }
    }
}
