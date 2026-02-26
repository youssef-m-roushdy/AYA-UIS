using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AYA_UIS.Application.Dtos.AuthDtos
{
    public class UpdateUserRoleDto
    {
        public string AcademicCode { get; set; } = string.Empty;
        public string NewRoleName { get; set; } = string.Empty;
    }
}
