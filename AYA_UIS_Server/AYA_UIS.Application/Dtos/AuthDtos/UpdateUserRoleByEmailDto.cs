using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AYA_UIS.Application.Dtos.AuthDtos
{
    public class UpdateUserRoleByEmailDto
    {
        public string Email { get; set; } = string.Empty;
        public string NewRoleName { get; set; } = string.Empty;
    }
}
