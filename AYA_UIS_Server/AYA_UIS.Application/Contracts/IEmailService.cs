namespace AYA_UIS.Application.Contracts
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string to, string displayName, string resetLink);
        Task SendPasswordChangedConfirmationAsync(string to, string displayName);
    }
}
