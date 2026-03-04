using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.AuthDtos;
using AYA_UIS.Domain.Entities.Identity;
using Microsoft.AspNetCore.Identity;

namespace AYA_UIS.Application.Dtos.AuthDtos
{
    public class AuthResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime AccessTokenExpiry { get; set; }
        public UserInfoDto User { get; set; }
    }
}