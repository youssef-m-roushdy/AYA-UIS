using AYA_UIS.Shared.Exceptions;
using System.Text.Json;

namespace AYA_UIS.MiddelWares
{
    public class GlobalExceptionHandlingMiddelWare
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlingMiddelWare> _logger;

        public GlobalExceptionHandlingMiddelWare(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddelWare> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
                
                // Handle 404 after the pipeline executes
                if (context.Response.StatusCode == StatusCodes.Status404NotFound && !context.Response.HasStarted)
                {
                    await HandleNotFoundExceptionAsync(context);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Something Went Wrong: {ex.Message}");
                
                if (!context.Response.HasStarted)
                {
                    await HandleErrorExceptAsync(context, ex);
                }
            }
        }

        private async Task HandleNotFoundExceptionAsync(HttpContext context)
        {
            context.Response.ContentType = "application/json";
            
            var response = new ErrorDetails()
            {
                StatusCode = StatusCodes.Status404NotFound,
                ErrorMessage = $"The endpoint '{context.Request.Path}' was not found"
            };

            var jsonResponse = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(jsonResponse);
        }

        private async Task HandleErrorExceptAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";

            var response = new ErrorDetails
            {
                ErrorMessage = ex.Message
            };

            // Set status code based on exception type
            context.Response.StatusCode = ex switch
            {
                ValidationException => HandleValidationException((ValidationException)ex, response),
                UnauthorizedException => StatusCodes.Status401Unauthorized,
                ForbiddenException => StatusCodes.Status403Forbidden,
                NotFoundException => StatusCodes.Status404NotFound,
                BadRequestException => StatusCodes.Status400BadRequest,
                ConflictException => StatusCodes.Status409Conflict,
                InternalServerErrorException => StatusCodes.Status500InternalServerError,
                BaseException baseEx => baseEx.StatusCode,
                _ => StatusCodes.Status500InternalServerError
            };

            response.StatusCode = context.Response.StatusCode;
            
            var jsonResponse = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(jsonResponse);
        }

        private int HandleValidationException(ValidationException validationException, ErrorDetails response)
        {
            response.Errors = validationException.Errors;
            return StatusCodes.Status400BadRequest;
        }
    }

    // You need this ErrorDetails class
    public class ErrorDetails
    {
        public int StatusCode { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public IEnumerable<string>? Errors { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}