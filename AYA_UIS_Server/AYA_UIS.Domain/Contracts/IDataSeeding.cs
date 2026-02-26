using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace AYA_UIS.Domain.Contracts
{
    public interface IDataSeeding
    {
        Task SeedDataInfoAsync();
        Task SeedIdentityDataAsync();
    }
}
