using DichVuCong.Api.Features.Chatbot.DocCauTraLoi;
using DichVuCong.Api.Features.Chatbot.TimKiem;
using DichVuCong.Api.Features.Chatbot.TraLoi;
using DichVuCong.Data.DuLieu;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DichVuCong.Api.Features.Chatbot;

public static class ChatbotServiceCollectionExtensions
{
    /// <summary>
    /// Dịch vụ của trợ lý theo nguồn dữ liệu (plan F00 §9.6): kho câu chưa trả lời và việc định kỳ xoá câu quá hạn
    /// (chạy trên cả hai nguồn), cùng trợ lý trả lời theo luật (F06): các bước trả lời chạy lần lượt theo
    /// <see cref="IChatHandler.ThuTu"/>, chỉ mục tìm kiếm trong bộ nhớ theo phiên bản dữ liệu và ngưỡng điểm
    /// (mục cấu hình <see cref="ChamDiemOptions.TenMuc"/>, có giá trị mặc định). Nguồn <see cref="LoaiNguonDuLieu.PostgreSql"/>
    /// cần <c>AppDbContext</c> đã đăng ký (<c>AddDichVuCongData</c>); nguồn <see cref="LoaiNguonDuLieu.Mau"/> không cần.
    /// Nguồn PostgreSql đọc trần số dòng từ mục <c>Chatbot:KhoCauChuaTraLoi</c> (<see cref="KhoCauChuaTraLoiOptions"/>,
    /// mặc định 50.000) và cần <c>IConfiguration</c> (host của API luôn có).
    /// </summary>
    public static IServiceCollection AddChatbot(this IServiceCollection services, LoaiNguonDuLieu nguon)
    {
        ArgumentNullException.ThrowIfNull(services);

        switch (nguon)
        {
            case LoaiNguonDuLieu.Mau:
                services.AddSingleton<IKhoCauChuaTraLoi, KhoCauChuaTraLoiMau>();
                break;
            case LoaiNguonDuLieu.PostgreSql:
                services.AddOptions<KhoCauChuaTraLoiOptions>()
                    .BindConfiguration(KhoCauChuaTraLoiOptions.TenMuc)
                    .ValidateDataAnnotations()
                    .ValidateOnStart();
                services.AddSingleton<CanhBaoKhoDay>();
                services.AddScoped<IKhoCauChuaTraLoi, KhoCauChuaTraLoiPostgreSql>();
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(nguon), nguon, "Nguồn dữ liệu không hỗ trợ.");
        }

        services.TryAddSingleton(TimeProvider.System);
        services.AddHostedService<XoaCauChuaTraLoiHetHan>();
        AddTroLy(services);
        services.AddScoped<IVietTatDocService, VietTatDocService>();

        return services;
    }

    private static void AddTroLy(IServiceCollection services)
    {
        services.AddOptions<ChamDiemOptions>()
            .BindConfiguration(ChamDiemOptions.TenMuc)
            .ValidateDataAnnotations()
            .ValidateOnStart();
        services.AddSingleton<KhoChiMuc>();
        services.AddScoped<ITroLyService, TroLyService>();
        services.AddScoped<DuLieuNho>();
        services.AddScoped<TraLoiTrungTam>();
        services.AddScoped<TraLoiThuTuc>();
        services.AddScoped<TraLoiChuDe>();

        // Các bước trả lời, chạy theo IChatHandler.ThuTu (nhỏ trước). Thêm bước mới = thêm một dòng ở đây.
        services.AddScoped<BuocKhongHieu>();
        services.AddScoped<IChatHandler, BuocTinhTrangHoSo>();
        services.AddScoped<IChatHandler, TraLoiQuay>();
        services.AddScoped<IChatHandler, BuocCauHoiMau>();
        services.AddScoped<IChatHandler, BuocMucThuTuc>();
        services.AddScoped<IChatHandler, BuocDanhSachThuTuc>();
        services.AddScoped<IChatHandler>(sp => sp.GetRequiredService<BuocKhongHieu>());
    }
}
