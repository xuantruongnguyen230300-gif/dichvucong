using DichVuCong.Data;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace DichVuCong.Api.Common.Hosting;

public static class NguonDuLieuExtensions
{
    /// <summary>
    /// Chọn nguồn dữ liệu theo <c>DuLieu:Nguon</c> (F00 plan §9.2). Kiểm cấu hình trước, chưa đăng ký gì khi cấu hình sai.
    /// Mẫu: nạp file nhúng ngay (hỏng thì ném, khởi động dừng), kiểm tra sẵn sàng <c>du-lieu</c>, không có <c>AppDbContext</c>.
    /// PostgreSql: bắt buộc <c>ConnectionStrings:DichVuCong</c>, kiểm tra sẵn sàng <c>db</c>.
    /// </summary>
    public static LoaiNguonDuLieu AddNguonDuLieu(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        var nguon = DuLieuOptions.DocNguon(configuration);
        var health = services.AddHealthChecks();
        switch (nguon)
        {
            case LoaiNguonDuLieu.Mau:
                services.AddDichVuCongDataMau();
                health.AddCheck<DuLieuSanSangCheck>("du-lieu", tags: [ApiHostingExtensions.ReadyTag]);
                services.AddHostedService(sp => new GhiLogNguonDuLieu(
                    nguon, sp.GetRequiredService<TepDuLieuMau>(), sp.GetRequiredService<ILogger<GhiLogNguonDuLieu>>()));
                break;
            case LoaiNguonDuLieu.PostgreSql:
                services.AddDichVuCongData(configuration.GetRequiredConnectionString("DichVuCong"));
                health.AddCheck<DbSanSangCheck>("db", tags: [ApiHostingExtensions.ReadyTag]);
                services.AddHostedService(sp => new GhiLogNguonDuLieu(
                    nguon, tep: null, sp.GetRequiredService<ILogger<GhiLogNguonDuLieu>>()));
                break;
            default:
                throw new InvalidOperationException($"Nguồn dữ liệu {nguon} chưa được hỗ trợ.");
        }

        return nguon;
    }
}

/// <summary>
/// Nguồn Mẫu: tốt khi <c>lan_nhap</c> có dòng, tức file đã nạp xong (nạp lỗi thì API không chạy — F00 plan §9.9).
/// </summary>
internal sealed class DuLieuSanSangCheck(INguonDuLieu nguon) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default) =>
        await nguon.LanNhaps.CoAsync(cancellationToken) ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy();
}

/// <summary>Một dòng log Information lúc khởi động nêu nguồn đang dùng. Không ghi chuỗi kết nối.</summary>
internal sealed partial class GhiLogNguonDuLieu(LoaiNguonDuLieu nguon, TepDuLieuMau? tep, ILogger<GhiLogNguonDuLieu> logger) : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
        if (tep is null)
        {
            LogPostgreSql(logger, nguon);
        }
        else
        {
            LogMau(logger, nguon, tep.PhienBan, tep.ThoiDiem, tep.ThuTuc.Count);
        }

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    [LoggerMessage(Level = LogLevel.Information, Message = "Nguồn dữ liệu: {Nguon}.")]
    private static partial void LogPostgreSql(ILogger logger, LoaiNguonDuLieu nguon);

    [LoggerMessage(Level = LogLevel.Information,
        Message = "Nguồn dữ liệu: {Nguon} (file mẫu phiên bản định dạng {PhienBan}, thời điểm {ThoiDiem:O}, {SoThuTuc} thủ tục).")]
    private static partial void LogMau(ILogger logger, LoaiNguonDuLieu nguon, int phienBan, DateTimeOffset thoiDiem, int soThuTuc);
}

/// <summary>
/// Nguồn PostgreSql: tốt khi kết nối được DB. Trả về trong <c>Hosting:ReadyTimeout</c> kể cả khi thư viện kết nối không huỷ được
/// (vd. tra tên máy chủ chậm) — BR-13 ≤ 2 giây. Lần kiểm bị bỏ dở vẫn chạy nốt ở nền rồi tự giải phóng DbContext.
/// Lỗi chỉ ghi tên loại, không ghi nội dung (có thể chứa địa chỉ máy chủ DB).
/// </summary>
internal sealed partial class DbSanSangCheck(IServiceScopeFactory scopes, HostingOptions hosting, ILogger<DbSanSangCheck> logger) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var tacVu = KiemTraAsync(scopes.CreateAsyncScope(), cancellationToken);
        try
        {
            return await tacVu.WaitAsync(hosting.ReadyTimeout, cancellationToken) ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy();
        }
        catch (TimeoutException)
        {
            return HealthCheckResult.Unhealthy();
        }
    }

    private async Task<bool> KiemTraAsync(AsyncServiceScope scope, CancellationToken cancellationToken)
    {
        await using (scope)
        {
            try
            {
                return await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.CanConnectAsync(cancellationToken);
            }
#pragma warning disable CA1031 // Không kết nối được vì lý do gì cũng là "không sẵn sàng"; chỉ ghi tên loại lỗi.
            catch (Exception ex)
#pragma warning restore CA1031
            {
                LogLoi(logger, ex.GetType().Name);
                return false;
            }
        }
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Kiểm tra DB không thành công ({LoaiLoi}).")]
    private static partial void LogLoi(ILogger logger, string loaiLoi);
}
