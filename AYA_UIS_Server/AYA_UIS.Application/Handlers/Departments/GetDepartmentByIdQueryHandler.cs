using AYA_UIS.Application.Queries.Departments;
using AutoMapper;
using AYA_UIS.Shared.Exceptions;
using MediatR;
using Shared.Respones;
using AYA_UIS.Application.Dtos.DepartmentDtos;
using AYA_UIS.Domain.Contracts;

namespace AYA_UIS.Application.Handlers.Departments
{
    public class GetDepartmentByIdQueryHandler : IRequestHandler<GetDepartmentByIdQuery, Response<DepartmentDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetDepartmentByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Response<DepartmentDto>> Handle(GetDepartmentByIdQuery request, CancellationToken cancellationToken)
        {
            var department = await _unitOfWork.Departments.GetByIdWithDetailsAsync(request.Id);
            
            if (department == null)
                throw new NotFoundException($"Department with ID {request.Id} not found");

            var result = _mapper.Map<DepartmentDto>(department);
            return Response<DepartmentDto>.SuccessResponse(result);
        }
    }
}
