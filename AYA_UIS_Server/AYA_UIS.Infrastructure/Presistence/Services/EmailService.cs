// Infrastructure/Persistence/Services/EmailService.cs
using AYA_UIS.Application.Contracts;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using Shared.Settings;

namespace AYA_UIS.Infrastructure.Presistence.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;

        public EmailService(IOptions<EmailSettings> settings)
        {
            _settings = settings.Value;
        }

        // ── Core send ──────────────────────────────────────────────────────────
        private async Task SendAsync(string to, string subject, string htmlBody)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.SenderName, _settings.Username));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;
            message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(
                _settings.SmtpServer,
                _settings.SmtpPort,
                _settings.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None
            );
            await client.AuthenticateAsync(_settings.Username, _settings.Password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }

        // ── Shared layout wrapper ──────────────────────────────────────────────
        private static string WrapInLayout(string content) => $"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <title>AYA Academy</title>
            </head>
            <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0"
                           style="max-width:600px;width:100%;border-radius:16px;
                                  overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

                      <!-- Header -->
                      <tr>
                        <td style="background:linear-gradient(145deg,#1e3c72 0%,#2a5298 100%);
                                   padding:36px 40px 28px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td>
                                <div style="display:inline-block;background:rgba(255,255,255,0.15);
                                            border-radius:12px;padding:10px 18px;margin-bottom:16px;">
                                  <span style="color:white;font-size:1.1rem;font-weight:700;
                                               letter-spacing:0.5px;">🎓 AYA Academy</span>
                                </div>
                                <p style="color:rgba(255,255,255,0.7);margin:0;font-size:0.85rem;">
                                  University Information System
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="background:#ffffff;padding:40px;">
                          {content}
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background:#f8fafc;padding:24px 40px;
                                   border-top:1px solid #e2e8f0;text-align:center;">
                          <p style="color:#94a3b8;font-size:0.8rem;margin:0 0 6px;">
                            © {DateTime.UtcNow.Year} AYA Academy · Akhbaralyoum Academy
                          </p>
                          <p style="color:#cbd5e1;font-size:0.75rem;margin:0;">
                            This is an automated message, please do not reply to this email.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;

        // ── 1. Password Reset Email ────────────────────────────────────────────
        public async Task SendPasswordResetEmailAsync(
            string to,
            string displayName,
            string resetLink)
        {
            var content = $"""
                <!-- Icon: table-based circle for universal email client support -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                  <tr>
                    <td align="center">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="72" height="72" align="center" valign="middle"
                              style="width:72px;height:72px;border-radius:50%;
                                     background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);">
                            <span style="font-size:32px;line-height:72px;display:block;">🔐</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Title -->
                <h1 style="color:#1e293b;font-size:1.5rem;font-weight:700;
                           text-align:center;margin:0 0 8px;">
                  Reset Your Password
                </h1>
                <p style="color:#64748b;text-align:center;margin:0 0 32px;font-size:0.95rem;">
                  We received a request to reset your password
                </p>

                <!-- Greeting -->
                <p style="color:#334155;font-size:0.95rem;margin:0 0 16px;">
                  Hello, <strong>{displayName}</strong> 👋
                </p>
                <p style="color:#475569;font-size:0.9rem;line-height:1.7;margin:0 0 28px;">
                  Someone requested a password reset for your AYA Academy account.
                  If this was you, click the button below to set a new password.
                  This link will expire in <strong style="color:#1e293b;">1 hour</strong>.
                </p>

                <!-- CTA Button -->
                <div style="text-align:center;margin:0 0 32px;">
                  <a href="{resetLink}"
                     style="display:inline-block;padding:15px 40px;
                            background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
                            color:white;text-decoration:none;border-radius:12px;
                            font-weight:600;font-size:1rem;
                            box-shadow:0 4px 15px rgba(102,126,234,0.4);
                            letter-spacing:0.3px;">
                    Reset My Password
                  </a>
                </div>

                <!-- Divider -->
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;"/>

                <!-- Fallback link -->
                <p style="color:#64748b;font-size:0.85rem;margin:0 0 8px;">
                  Button not working? Copy and paste this link into your browser:
                </p>
                <p style="margin:0 0 24px;">
                  <a href="{resetLink}"
                     style="color:#667eea;font-size:0.82rem;word-break:break-all;">
                    {resetLink}
                  </a>
                </p>

                <!-- Security notice -->
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
                            padding:16px 20px;">
                  <p style="color:#64748b;font-size:0.85rem;margin:0;line-height:1.6;">
                    🔒 <strong>Security notice:</strong> If you didn't request this,
                    you can safely ignore this email. Your password will not change
                    unless you click the link above.
                  </p>
                </div>
                """;

            await SendAsync(to, "Reset Your Password — AYA Academy", WrapInLayout(content));
        }

        // ── 2. Password Changed Confirmation Email ─────────────────────────────
        public async Task SendPasswordChangedConfirmationAsync(
            string to,
            string displayName)
        {
            var changedAt = DateTime.UtcNow.ToString("MMMM dd, yyyy 'at' HH:mm 'UTC'");

            var content = $"""
                <!-- Icon: table-based circle for universal email client support -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                  <tr>
                    <td align="center">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="72" height="72" align="center" valign="middle"
                              style="width:72px;height:72px;border-radius:50%;
                                     background:linear-gradient(135deg,#10b981 0%,#059669 100%);">
                            <span style="font-size:32px;line-height:72px;display:block;">✅</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Title -->
                <h1 style="color:#1e293b;font-size:1.5rem;font-weight:700;
                           text-align:center;margin:0 0 8px;">
                  Password Changed Successfully
                </h1>
                <p style="color:#64748b;text-align:center;margin:0 0 32px;font-size:0.95rem;">
                  Your account password has been updated
                </p>

                <!-- Greeting -->
                <p style="color:#334155;font-size:0.95rem;margin:0 0 16px;">
                  Hello, <strong>{displayName}</strong> 👋
                </p>
                <p style="color:#475569;font-size:0.9rem;line-height:1.7;margin:0 0 24px;">
                  This email confirms that your AYA Academy account password was
                  successfully changed on <strong style="color:#1e293b;">{changedAt}</strong>.
                </p>

                <!-- Info box -->
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;
                            border-radius:10px;padding:16px 20px;margin-bottom:28px;">
                  <p style="color:#166534;font-size:0.875rem;margin:0;line-height:1.6;">
                    ✔ &nbsp;You can now log in using your new password.
                  </p>
                </div>

                <!-- Divider -->
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;"/>

                <!-- Security warning -->
                <div style="background:#fef2f2;border:1px solid #fecaca;
                            border-radius:10px;padding:16px 20px;">
                  <p style="color:#991b1b;font-size:0.85rem;margin:0;line-height:1.6;">
                    ⚠️ <strong>Wasn't you?</strong> If you did not make this change,
                    please contact your administrator immediately or reset your
                    password right away to secure your account.
                  </p>
                </div>
                """;

            await SendAsync(
                to,
                "Your Password Has Been Changed — AYA Academy",
                WrapInLayout(content));
        }
    }
}