using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AYA_UIS.Domain.Entities.Identity;

namespace AYA_UIS.Application.Contracts
{
    public interface IJwtService
    {
        Task<string> GenerateAccessTokenAsync(User user);
        RefreshToken GenerateRefreshToken();
    }
}