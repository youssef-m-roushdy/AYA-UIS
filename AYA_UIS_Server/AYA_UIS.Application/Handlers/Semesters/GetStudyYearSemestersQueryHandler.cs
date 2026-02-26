using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using AYA_UIS.Application.Dtos.SemesterDtos;
using AYA_UIS.Application.Queries.Semesters;
using AYA_UIS.Domain.Contracts;
using MediatR;

namespace AYA_UIS.Application.Handlers.Semesters
{
    public class GetStudyYearSemestersQueryHandler : IRequestHandler<GetStudyYearSemestersQuery, IEnumerable<SemesterDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public GetStudyYearSemestersQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<SemesterDto>> Handle(GetStudyYearSemestersQuery request, CancellationToken cancellationToken)
        {
            var semesters = await _unitOfWork.Semesters.GetByStudyYearIdAsync(request.StudyYearId);
            return _mapper.Map<IEnumerable<SemesterDto>>(semesters);
        }
    }
}