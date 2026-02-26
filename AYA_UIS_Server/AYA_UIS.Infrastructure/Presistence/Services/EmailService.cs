using AYA_UIS.Application.Contracts;

namespace AYA_UIS.Infrastructure.Presistence.Services
{
    public class EmailService : IEmailService
    {
        public Task SendEmailAsync(string to, string subject, string body)
        {
            // TODO: Implement email sending with MailKit
            throw new NotImplementedException();
        }
    }
}