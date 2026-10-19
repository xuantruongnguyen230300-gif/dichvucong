namespace DichVuCong.Api.Common.Hosting;

/// <summary>
/// Chặn sớm request có Content-Length vượt giới hạn → 413 ProblemDetails, bất kể endpoint có đọc body hay không.
/// Request không khai Content-Length (chunked) vẫn bị Kestrel chặn khi đọc; lỗi đó đi qua exception handler.
/// </summary>
public sealed class RequestSizeLimitMiddleware(RequestDelegate next, HostingOptions options, IProblemDetailsService problems)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.ContentLength > options.MaxRequestBodyBytes)
        {
            context.Response.StatusCode = StatusCodes.Status413PayloadTooLarge;
            await problems.TryWriteAsync(new ProblemDetailsContext { HttpContext = context });
            return;
        }

        await next(context);
    }
}
