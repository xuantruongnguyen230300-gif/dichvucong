using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace DichVuCong.Api.Common.Errors;

/// <summary>Lỗi không bắt được → ProblemDetails. Ngoài Development không có chi tiết lỗi.</summary>
public sealed partial class GlobalExceptionHandler(
    IProblemDetailsService problems,
    IHostEnvironment environment,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        int status;
        if (exception is BadHttpRequestException bad)
        {
            status = bad.StatusCode;
        }
        else
        {
            status = StatusCodes.Status500InternalServerError;
            var ma = MaTraCuu.LayHoacTao(httpContext);
            using var scope = logger.BeginScope(new Dictionary<string, object> { ["TraceId"] = httpContext.TraceIdentifier });
            LogUnhandled(logger, exception, ma, httpContext.Request.Method, NhatKy.MauDuongDan(httpContext, status));
        }

        var development = environment.IsDevelopment();
        httpContext.Response.StatusCode = status;
        return await problems.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = new ProblemDetails
            {
                Status = status,
                Detail = development ? exception.Message : null,
            },
        });
    }

    [LoggerMessage(Level = LogLevel.Error, Message = "Lỗi {MaTraCuu}: không bắt được, {PhuongThuc} {DuongDan}")]
    private static partial void LogUnhandled(ILogger logger, Exception exception, string maTraCuu, string phuongThuc, string duongDan);
}
