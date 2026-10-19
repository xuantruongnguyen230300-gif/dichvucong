using DichVuCong.Api.Common.Hosting;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DichVuCong.Api.Common.Caching;

public static class CachePolicies
{
    public const string DanhMuc = "danh-muc";

    public static IServiceCollection AddApiOutputCache(this IServiceCollection services, IConfiguration configuration)
    {
        var options = configuration.GetValidatedOptions<CachingOptions>(CachingOptions.SectionName);

        services.AddSingleton(options);
        services.TryAddSingleton(TimeProvider.System);
        services.AddSingleton<BoNhoPhienBanDuLieu>();
        services.AddScoped<IPhienBanDuLieu, PhienBanDuLieu>();
        services.AddOutputCache(cache =>
            cache.AddPolicy(DanhMuc, new DanhMucCachePolicy(options.DanhMuc)));

        return services;
    }
}
