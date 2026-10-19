namespace DichVuCong.Api.Common.Security;

/// <summary>
/// Gắn header bảo mật vào mọi response. Dùng OnStarting để header vẫn có
/// khi exception handler xoá response và ghi lại lỗi.
/// </summary>
public sealed class SecurityHeadersMiddleware(RequestDelegate next, IHostEnvironment environment)
{
    private readonly bool _hsts = !environment.IsDevelopment();

    public Task InvokeAsync(HttpContext context)
    {
        context.Response.OnStarting(static state =>
        {
            var (ctx, hsts) = ((HttpContext, bool))state;
            var headers = ctx.Response.Headers;
            foreach (var (name, value) in SecurityHeaders.Always)
            {
                headers[name] = value;
            }

            if (hsts && ctx.Request.IsHttps)
            {
                headers.StrictTransportSecurity = SecurityHeaders.StrictTransportSecurity;
            }

            return Task.CompletedTask;
        }, (context, _hsts));

        return next(context);
    }
}
