using DichVuCong.Api.Common.Hosting;

namespace DichVuCong.Api.Features.ThongTinTrungTam;

public static class ThongTinTrungTamServiceCollectionExtensions
{
    /// <summary>Dịch vụ thông tin Trung tâm và bộ chèn dữ liệu đặc tả vào HTML (F08).</summary>
    public static IServiceCollection AddThongTinTrungTam(this IServiceCollection services)
    {
        services.AddMemoryCache();
        services.AddScoped<IThongTinTrungTamService, ThongTinTrungTamService>();
        services.AddScoped<ITrangHtml, TrangHtml>();

        return services;
    }
}
