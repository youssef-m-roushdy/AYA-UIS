using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using AYA_UIS.Application.Dtos.DepartmentDtos.FeeDtos;
using AYA_UIS.Application.Queries.Fees;
using AYA_UIS.Domain.Contracts;
using MediatR;

namespace AYA_UIS.Application.Handlers.Fees
{
    public class GetFeesOfDepartmentForStudyYearQueryHandler : IRequestHandler<GetFeesOfDepartmentForStudyYearQuery, List<FeeDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetFeesOfDepartmentForStudyYearQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<FeeDto>> Handle(GetFeesOfDepartmentForStudyYearQuery request, CancellationToken cancellationToken)
        {
            var fees = await _unitOfWork.Fees.GetFeesOfDepartmentForStudyYear(request.DepartmentId, request.StudyYearId);
            var feeDtos = fees.Select(f => _mapper.Map<FeeDto>(f)).ToList();

            return feeDtos;
        }
    }
}