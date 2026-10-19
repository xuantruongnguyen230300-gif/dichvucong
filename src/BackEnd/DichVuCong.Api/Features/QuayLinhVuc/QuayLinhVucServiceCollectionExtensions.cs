namespace DichVuCong.Api.Features.QuayLinhVuc;

public static class QuayLinhVucServiceCollectionExtensions
{
    /// <summary>Dịch vụ quầy theo lĩnh vực (F05).</summary>
    public static IServiceCollection AddQuayLinhVuc(this IServiceCollection services)
    {
        services.AddScoped<IQuayLinhVucService, QuayLinhVucService>();

        return services;
    }
}
