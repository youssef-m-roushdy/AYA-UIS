using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.SemesterDtos;
using AYA_UIS.Application.Queries.Semesters;
using AYA_UIS.Domain.Contracts;
using MediatR;

namespace AYA_UIS.Application.Handlers.StudyYears
{
    public class GetStudyYearSemestersQueryHandler : IRequestHandler<GetStudyYearSemestersQuery, List<SemesterDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetStudyYearSemestersQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<SemesterDto>> Handle(GetStudyYearSemestersQuery request, CancellationToken cancellationToken)
        {
            var semesters = await _unitOfWork.Semesters.GetByStudyYearIdAsync(request.StudyYearId);
            return semesters.Select(s => new SemesterDto
            {
                Id = s.Id,
                Title = s.Title,
                StartDate = s.StartDate,
                EndDate = s.EndDate
            }).ToList();
        }
    }
}