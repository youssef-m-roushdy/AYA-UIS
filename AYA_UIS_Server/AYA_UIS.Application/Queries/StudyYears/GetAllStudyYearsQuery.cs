using AYA_UIS.Application.Dtos.StudyYearDtos;
using MediatR;

namespace AYA_UIS.Application.Queries.StudyYears;

public record GetAllStudyYearsQuery : IRequest<IEnumerable<StudyYearDto>>;
