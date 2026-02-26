using AYA_UIS.Application.Dtos.StudyYearDtos;
using AYA_UIS.Application.Queries.StudyYears;
using AYA_UIS.Domain.Contracts;
using MediatR;

namespace AYA_UIS.Application.Handlers.StudyYears;

public class GetAllStudyYearsQueryHandler : IRequestHandler<GetAllStudyYearsQuery, IEnumerable<StudyYearDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllStudyYearsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<StudyYearDto>> Handle(GetAllStudyYearsQuery request, CancellationToken cancellationToken)
    {
        var studyYears = await _unitOfWork.StudyYears.GetAllAsync();
        return studyYears
            .OrderByDescending(sy => sy.StartYear)
            .Select(sy => new StudyYearDto
            {
                Id = sy.Id,
                StartYear = sy.StartYear,
                EndYear = sy.EndYear,
                IsCurrent = sy.IsCurrent
            });
    }
}
