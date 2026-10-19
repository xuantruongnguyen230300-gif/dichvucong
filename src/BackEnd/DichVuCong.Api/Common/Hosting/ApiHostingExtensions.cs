using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Common.Errors;
using DichVuCong.Api.Common.RateLimiting;
using DichVuCong.Api.Common.Security;
using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Api.Features.ChiTietThuTuc;
using DichVuCong.Api.Features.DanhMuc;
using DichVuCong.Api.Features.QuayLinhVuc;
using DichVuCong.Api.Features.ThongTinTrungTam;
using Microsoft.AspNetCore.HostFiltering;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace DichVuCong.Api.Common.Hosting;

public static class ApiHostingExtensions
{
    internal const string ReadyTag = "ready";

    // Ứng dụng chỉ đọc: sai phương thức thì routing trả 405.
    private static readonly HttpMethodMetadata ReadOnlyMethods = new(["GET", "HEAD"]);

    /// <summary>Kestrel: tắt header Server, giới hạn kích thước body.</summary>
    public static WebApplicationBuilder AddApiHosting(this WebApplicationBuilder builder)
    {
        var options = builder.Configuration.GetValidatedOptions<HostingOptions>(HostingOptions.SectionName);

        builder.WebHost.ConfigureKestrel(kestrel =>
        {
            kestrel.AddServerHeader = false;
            kestrel.Limits.MaxRequestBodySize = options.MaxRequestBodyBytes;
        });

        return builder;
    }

    /// <summary>Controller, ProblemDetails, rate limit, nén, cache, health, OpenAPI.</summary>
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        var hosting = configuration.GetValidatedOptions<HostingOptions>(HostingOptions.SectionName);
        var nguon = services.AddNguonDuLieu(configuration);
        services.AddControllers(mvc => mvc.Filters.Add<DemPhanHoiDanhMucFilter>());
        services.AddSingleton(hosting);
        if (hosting.ForwardedHeaders.Bat)
        {
            services.Configure<ForwardedHeadersOptions>(hosting.ForwardedHeaders.ApDung);
        }

        services.AddSingleton(TenMienCongKhai.TuCauHinh(configuration));
        services.AddHostedService<CanhBaoTenMien>();
        // Lọc Host do KiemTraHostMiddleware làm; tắt bản của framework (đứng ngoài cùng, response 400 thiếu header bảo mật).
        services.Configure<HostFilteringOptions>(host => host.AllowedHosts = ["*"]);
        services.AddProblemDetails(options => options.CustomizeProblemDetails = ProblemDetailsCustomizer.Apply);
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddApiRateLimiting(configuration);
        services.AddApiOutputCache(configuration);
        services.AddResponseCompression(compression =>
        {
            compression.EnableForHttps = true;
            compression.Providers.Add<BrotliCompressionProvider>();
            compression.Providers.Add<GzipCompressionProvider>();
        });
        services.Configure<HealthCheckServiceOptions>(health =>
        {
            foreach (var registration in health.Registrations)
            {
                registration.Timeout = hosting.ReadyTimeout;
            }
        });
        services.AddThongTinTrungTam();
        services.AddChiTietThuTuc();
        services.AddDanhMuc();
        services.AddQuayLinhVuc();
        services.AddChatbot(nguon);
        services.AddOpenApi();

        return services;
    }

    public static WebApplication UseApiPipeline(this WebApplication app)
    {
        // Chỉ khi đã khai proxy tin cậy (Hosting:ForwardedHeaders): đứng đầu để IP, scheme, host gốc có hiệu lực cho mọi bước sau
        // (HSTS, redirect HTTPS, lọc Host, giới hạn tốc độ, og:url).
        if (app.Services.GetRequiredService<HostingOptions>().ForwardedHeaders.Bat)
        {
            app.UseForwardedHeaders();
        }

        // Header bảo mật đứng đầu để cả response lỗi và redirect đều có.
        app.UseMiddleware<SecurityHeadersMiddleware>();
        app.UseExceptionHandler();
        app.UseMiddleware<KiemTraHostMiddleware>();
        app.UseMiddleware<RequestSizeLimitMiddleware>();
        app.UseStatusCodePages();
        app.UseHttpsRedirection();
        app.UseResponseCompression();
        app.UseStaticFiles(new StaticFileOptions { OnPrepareResponse = StaticAssets.SetCacheControl });
        app.UseSwaggerUiChoDev();
        app.UseRouting();
        app.UseRateLimiter();
        app.UseMiddleware<DanhMucNotModifiedMiddleware>();
        app.UseOutputCache();

        return app;
    }

    public static WebApplication MapApiEndpoints(this WebApplication app)
    {
        app.MapControllers();
        app.MapHealthChecks("/health/live", new() { Predicate = _ => false })
            .RequireRateLimiting(RateLimitPolicies.DanhMuc)
            .WithMetadata(ReadOnlyMethods);
        app.MapHealthChecks("/health/ready", new() { Predicate = check => check.Tags.Contains(ReadyTag) })
            .RequireRateLimiting(RateLimitPolicies.DanhMuc)
            .WithMetadata(ReadOnlyMethods);

        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        // Không giới hạn phương thức: SpaFallback tự trả 405 với Allow đúng (xem ghi chú ở đó).
        app.MapFallback(SpaFallback.Pattern, SpaFallback.Handle);

        return app;
    }
}
