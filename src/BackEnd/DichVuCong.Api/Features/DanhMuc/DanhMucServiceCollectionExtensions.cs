namespace DichVuCong.Api.Features.DanhMuc;

public static class DanhMucServiceCollectionExtensions
{
    /// <summary>Dịch vụ danh mục thủ tục và lĩnh vực (F04).</summary>
    public static IServiceCollection AddDanhMuc(this IServiceCollection services)
    {
        services.AddScoped<IDanhMucService, DanhMucService>();

        return services;
    }
}
