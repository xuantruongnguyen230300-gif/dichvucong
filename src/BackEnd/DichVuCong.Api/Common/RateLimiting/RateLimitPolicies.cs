using System.Globalization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

using DichVuCong.Api.Common.Hosting;

namespace DichVuCong.Api.Common.RateLimiting;

public static class RateLimitPolicies
{
    public const string DanhMuc = "danh-muc";
    public const string TroLy = "tro-ly";

    public static IServiceCollection AddApiRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        var options = configuration.GetValidatedOptions<RateLimitingOptions>(RateLimitingOptions.SectionName);

        services.AddRateLimiter(limiter =>
        {
            limiter.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            limiter.AddPolicy(DanhMuc, context => PerIp(context, options.DanhMuc));
            limiter.AddPolicy(TroLy, context => PerIp(context, options.TroLy));
            limiter.OnRejected = WriteRejectionAsync;
        });

        return services;
    }

    private static RateLimitPartition<string> PerIp(HttpContext context, int permitPerMinute) =>
        RateLimitPartition.GetFixedWindowLimiter(
            KhoaGioiHan.TuIp(context.Connection.RemoteIpAddress),
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitPerMinute,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            });

    private static async ValueTask WriteRejectionAsync(OnRejectedContext context, CancellationToken cancellationToken)
    {
        var response = context.HttpContext.Response;
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString(CultureInfo.InvariantCulture);
        }

        var problems = context.HttpContext.RequestServices.GetRequiredService<IProblemDetailsService>();
        response.StatusCode = StatusCodes.Status429TooManyRequests;
        await problems.TryWriteAsync(new ProblemDetailsContext { HttpContext = context.HttpContext });
    }
}
