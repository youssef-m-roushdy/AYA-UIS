using System.ComponentModel.DataAnnotations;

namespace AYA_UIS.Application.Dtos.AuthDtos
{
    public record CreateRoleDto
    {
        [Required]
        public string RoleName { get; set; } = string.Empty;
    }
}
