namespace DichVuCong.Api.Features.ChiTietThuTuc;

public static class ChiTietThuTucServiceCollectionExtensions
{
    /// <summary>Dịch vụ chi tiết thủ tục cho popup (F03) và ràng buộc route của mã thủ tục.</summary>
    public static IServiceCollection AddChiTietThuTuc(this IServiceCollection services)
    {
        services.AddScoped<IChiTietThuTucService, ChiTietThuTucService>();
        services.Configure<RouteOptions>(options => options.ConstraintMap[MaThuTucRouteConstraint.Ten] = typeof(MaThuTucRouteConstraint));

        return services;
    }
}
