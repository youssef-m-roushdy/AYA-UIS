using System.ComponentModel.DataAnnotations;

namespace AYA_UIS.Application.Dtos.AuthDtos
{
    public record UpdateRoleDto
    {
        [Required]
        public string NewRoleName { get; set; } = string.Empty;
    }
}
