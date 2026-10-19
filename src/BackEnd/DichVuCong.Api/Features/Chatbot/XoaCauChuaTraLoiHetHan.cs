using System.Data.Common;
using System.Globalization;
using System.Net.Sockets;
using DichVuCong.Data.Entities;

namespace DichVuCong.Api.Features.Chatbot;

/// <summary>
/// Xoá câu chưa trả lời quá <see cref="CauChuaTraLoi.ThoiGianGiu"/> kể từ lần gặp cuối (F06 BR-12, F01 plan §8.2).
/// Chạy một lượt lúc khởi động rồi mỗi <see cref="ChuKy"/>, trên kho của nguồn đang dùng (PostgreSQL hay bộ nhớ — plan F00 §9.6).
/// Lỗi kho (vd. DB không tới được) không làm dừng API: ghi Warning, lượt sau thử lại.
/// Nhiều bản API cùng chạy thì cùng xoá; xoá lặp lại không đổi kết quả.
/// </summary>
internal sealed partial class XoaCauChuaTraLoiHetHan(
    IServiceScopeFactory scopeFactory,
    TimeProvider timeProvider,
    ILogger<XoaCauChuaTraLoiHetHan> logger) : BackgroundService
{
    /// <summary>Khoảng cách giữa hai lượt xoá.</summary>
    internal static readonly TimeSpan ChuKy = TimeSpan.FromHours(1);

    /// <summary>Câu có lần gặp cuối trước mốc này là quá hạn.</summary>
    internal static DateTimeOffset MocHetHan(DateTimeOffset bayGio) => bayGio - CauChuaTraLoi.ThoiGianGiu;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(ChuKy, timeProvider);
        do
        {
            await XoaMotLuotAsync(stoppingToken);
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    /// <summary>
    /// Một lượt xoá qua <see cref="IKhoCauChuaTraLoi.XoaQuaHanAsync"/> (lan_gap_cuoi &lt; bây giờ − 90 ngày; đúng 90 ngày còn giữ). Lỗi khi xoá chỉ ghi log; lỗi lấy dịch vụ (cấu hình sai) thì ném ra
    /// để lộ ngay lúc khởi động.
    /// </summary>
    internal async Task XoaMotLuotAsync(CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var kho = scope.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>();
        var bayGio = timeProvider.GetUtcNow();

        try
        {
            var moc = MocHetHan(bayGio);
            var soDong = await kho.XoaQuaHanAsync(moc, cancellationToken);

            LogDaXoa(logger, soDong, moc);
        }
        catch (Exception ex) when (ex is not OperationCanceledException || !cancellationToken.IsCancellationRequested)
        {
            // Kho PostgreSQL: mất kết nối, DB chưa migrate, hết thời gian chờ… đều chờ lượt sau. Lỗi kết nối tạm thời của Npgsql tới đây
            // dưới dạng InvalidOperationException bọc NpgsqlException (execution strategy mặc định), nên không lọc theo kiểu lỗi.
            // Không log đối tượng lỗi: message và stack của Npgsql có host:port của DB. Chỉ log loại lỗi và mã lỗi.
            var (loaiLoi, maLoi) = MoTaLoi(ex);
            LogKhongXoaDuoc(logger, loaiLoi, maLoi, ChuKy);
        }
    }

    [LoggerMessage(Level = LogLevel.Information,
        Message = "Đã xoá {SoDong} câu chưa trả lời có lần gặp cuối trước {Moc}")]
    private static partial void LogDaXoa(ILogger logger, int soDong, DateTimeOffset moc);

    /// <summary>
    /// Loại và mã của lỗi, không có message. Duyệt chuỗi lỗi trong: ưu tiên mã SQLSTATE của PostgreSQL, rồi mã lỗi socket,
    /// rồi mã lỗi của <see cref="DbException"/>; không có thì mã là "-".
    /// </summary>
    internal static (string Loai, string Ma) MoTaLoi(Exception loi)
    {
        DbException? loiDb = null;
        SocketException? loiSocket = null;
        for (var e = loi; e is not null; e = e.InnerException)
        {
            loiDb ??= e as DbException;
            loiSocket ??= e as SocketException;
        }

        if (loiDb is { SqlState: { Length: > 0 } sqlState })
        {
            return (loiDb.GetType().Name, sqlState);
        }

        if (loiSocket is not null)
        {
            return (loiSocket.GetType().Name, loiSocket.SocketErrorCode.ToString());
        }

        return loiDb is not null
            ? (loiDb.GetType().Name, loiDb.ErrorCode.ToString(CultureInfo.InvariantCulture))
            : (loi.GetType().Name, "-");
    }

    [LoggerMessage(Level = LogLevel.Warning,
        Message = "Không xoá được câu chưa trả lời quá hạn ({LoaiLoi}, mã {MaLoi}); thử lại sau {ChuKy}")]
    private static partial void LogKhongXoaDuoc(ILogger logger, string loaiLoi, string maLoi, TimeSpan chuKy);
}
