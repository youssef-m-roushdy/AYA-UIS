using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.DepartmentDtos.FeeDtos
{
    public class CreateFeeDto
    {
        public decimal Amount { get; set; }
        public FeeType Type { get; set; }
        public Levels Level { get; set; } // first year, second year, etc.
        public string? Description { get; set; }
        public int StudyYearId { get; set; } // means the academic year for which this fee is applicable
        public int DepartmentId { get; set; } // to link the fee to a specific department, as each department can have multiple fees for different levels and academic years
    }
}