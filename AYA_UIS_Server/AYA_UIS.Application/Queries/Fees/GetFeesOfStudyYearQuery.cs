using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.DepartmentDtos.FeeDtos;
using MediatR;

namespace AYA_UIS.Application.Queries.Fees
{
    public class GetFeesOfStudyYearQuery : IRequest<List<FeeDto>>
    {
        public int StudyYearId { get; set; }

        public GetFeesOfStudyYearQuery(int studyYearId)
        {
            StudyYearId = studyYearId;
        }
    }
}