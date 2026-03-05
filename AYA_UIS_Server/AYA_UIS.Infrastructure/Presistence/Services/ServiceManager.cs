using AYA_UIS.Application.Contracts;
using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Shared.Settings;

namespace AYA_UIS.Infrastructure.Presistence.Services
{
    public class ServiceManager : IServiceManager
    {
        private readonly Lazy<IAuthenticationService> _authService;
        private readonly Lazy<IRoleService> _roleService;
        private readonly Lazy<IUserService> _userService;

        public ServiceManager(
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            IJwtService jwtService,
            IOptions<JwtSettings> settings,
            IUserService userService,
            IUnitOfWork unitOfWork,
            IOptions<EmailSettings> emailSettings,
            IEmailService emailService,
            UniversityDbContext context)
        {
            _authService = new Lazy<IAuthenticationService>(
                () => new AuthenticationService(
                    userManager,
                    roleManager,
                    jwtService,
                    settings,
                    emailSettings,
                    unitOfWork,
                    emailService,
                    // ← Fixed: IOptions<EmailSettings> parameter
                    context));      // ← Fixed: UniversityDbContext parameter

            _roleService = new Lazy<IRoleService>(
                () => new RoleService(roleManager, userManager));

            _userService = new Lazy<IUserService>(
                () => userService);
        }

        public IAuthenticationService AuthenticationService => _authService.Value;
        public IRoleService RoleService => _roleService.Value;
        public IUserService UserService => _userService.Value;
    }
}