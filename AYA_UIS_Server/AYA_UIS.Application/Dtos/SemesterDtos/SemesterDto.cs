using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.SemesterDtos
{
    public class SemesterDto
    {
        public int Id { get; set; }
        public SemesterEnum Title { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}