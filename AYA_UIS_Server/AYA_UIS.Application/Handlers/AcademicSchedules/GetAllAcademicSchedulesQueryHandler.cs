using AYA_UIS.Application.Queries.AcademicSchedules;
using AutoMapper;
using AYA_UIS.Shared.Exceptions;
using MediatR;
using AYA_UIS.Domain.Contracts;
using AYA_UIS.Application.Dtos.AcademicSheduleDtos;

namespace AYA_UIS.Application.Handlers.AcademicSchedules
{
    public class GetAllAcademicSchedulesQueryHandler : IRequestHandler<GetAllAcademicSchedulesQuery, List<AcademicSchedulesDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetAllAcademicSchedulesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<AcademicSchedulesDto>> Handle(GetAllAcademicSchedulesQuery request, CancellationToken cancellationToken)
        {
            var schedules = await _unitOfWork.AcademicSchedules.GetAllWithDetailsAsync();

            var result = _mapper.Map<List<AcademicSchedulesDto>>(schedules);

            return result;
        }
    }
}
