using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Features.ChiTietThuTuc;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>
/// Những thứ host thật đăng ký sẵn mà <c>AddChatbot</c> dùng (nguồn dữ liệu, phiên bản dữ liệu, chi tiết thủ tục, cấu hình).
/// Test dựng riêng một <see cref="ServiceCollection"/> rồi build với <c>ValidateOnBuild</c> gọi hàm này để provider build được;
/// cái nào test đã tự đăng ký thì giữ nguyên (<c>TryAdd</c>).
/// </summary>
internal static class PhuThuocChatbot
{
    public static IServiceCollection ThemPhuThuocTroLy(this IServiceCollection services)
    {
        services.TryAddSingleton<IConfiguration>(new ConfigurationBuilder().Build());
        services.TryAddSingleton<INguonDuLieu>(_ => new NguonDuLieuMau(new TepDuLieuMau { ThoiDiem = new DateTimeOffset(2026, 10, 13, 0, 0, 0, TimeSpan.Zero) }));
        services.TryAddScoped<IPhienBanDuLieu, PhienBanTheoNguon>();
        services.TryAddScoped<IChiTietThuTucService, ChiTietThuTucService>();

        return services;
    }
}
