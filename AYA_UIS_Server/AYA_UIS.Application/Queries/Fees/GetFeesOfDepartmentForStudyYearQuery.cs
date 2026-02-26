using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.DepartmentDtos.FeeDtos;
using MediatR;

namespace AYA_UIS.Application.Queries.Fees
{
    public class GetFeesOfDepartmentForStudyYearQuery : IRequest<List<FeeDto>>
    {
        public int DepartmentId { get; set; }
        public int StudyYearId { get; set; }

        public GetFeesOfDepartmentForStudyYearQuery(int departmentId, int studyYearId)
        {
            DepartmentId = departmentId;
            StudyYearId = studyYearId;
        }
    }
}