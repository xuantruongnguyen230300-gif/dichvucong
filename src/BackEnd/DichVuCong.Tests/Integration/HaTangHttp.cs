using System.Diagnostics;
using System.Globalization;
using DichVuCong.Data.Mau;
using DichVuCong.Tests.Api;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace DichVuCong.Tests.Integration;

/// <summary>Ghi lại các lệnh SQL mà EF đã chạy (tester đếm số truy vấn mỗi yêu cầu, F03 HN-09, F04 HD-10).</summary>
public sealed class BoGhiLenhSql : ILoggerProvider
{
    private readonly List<string> _lenh = [];
    private readonly Lock _khoa = new();

    public IReadOnlyList<string> Lenh
    {
        get
        {
            lock (_khoa)
            {
                return [.. _lenh];
            }
        }
    }

    public void Xoa()
    {
        lock (_khoa)
        {
            _lenh.Clear();
        }
    }

    public ILogger CreateLogger(string categoryName) =>
        categoryName == "Microsoft.EntityFrameworkCore.Database.Command" ? new BoGhi(this) : Microsoft.Extensions.Logging.Abstractions.NullLogger.Instance;

    public void Dispose()
    {
    }

    private sealed class BoGhi(BoGhiLenhSql cha) : ILogger
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => logLevel >= LogLevel.Information;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            if (eventId.Name != "Microsoft.EntityFrameworkCore.Database.Command.CommandExecuted")
            {
                return;
            }

            var cau = formatter(state, exception);

            // Việc nền XoaCauChuaTraLoiHetHan (F06) chạy một lệnh DELETE ngay khi máy chủ khởi động, có thể rơi vào sau lúc test gọi Xoa().
            // Đó không phải lệnh của yêu cầu HTTP đang đếm: bỏ ra để số lệnh mỗi yêu cầu không phụ thuộc thời điểm khởi động.
            if (cau.Contains("DELETE FROM cau_chua_tra_loi", StringComparison.Ordinal))
            {
                return;
            }

            lock (cha._khoa)
            {
                cha._lenh.Add(cau);
            }
        }
    }
}

/// <summary>API với nguồn PostgreSql trỏ vào DB thử của tester; giới hạn tần suất đặt rất lớn để đo; ghi lại lệnh SQL.</summary>
public sealed class PostgreSqlThatApiFactory(string chuoiKetNoi) : ApiFactory
{
    public BoGhiLenhSql Sql { get; } = new();

    protected override string? NguonDuLieu => "PostgreSql";

    protected override string? ChuoiKetNoi => chuoiKetNoi;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.UseSetting("RateLimiting:DanhMuc", "100000");
        builder.ConfigureLogging(l =>
        {
            l.AddProvider(Sql);
            l.AddFilter("Microsoft.EntityFrameworkCore.Database.Command", LogLevel.Information);
        });
    }
}

/// <summary>API với nguồn Mẫu (file nhúng), giới hạn tần suất đặt rất lớn để đo.</summary>
public sealed class MauApiFactoryDo : ApiFactory
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.UseSetting("RateLimiting:DanhMuc", "100000");
    }
}

public static class DoDac
{
    public static TepDuLieuMau DocFileNhung() => TepDuLieuMau.DocTaiNguyen(typeof(TepDuLieuMau).Assembly, TepDuLieuMau.TenTaiNguyen);

    /// <summary>Phân vị p (0–100) của dãy mili giây, nội suy thứ hạng gần nhất.</summary>
    public static double PhanVi(IReadOnlyList<double> mau, double p)
    {
        var daSap = mau.Order().ToArray();
        var hang = (int)Math.Ceiling(p / 100d * daSap.Length) - 1;
        return daSap[Math.Clamp(hang, 0, daSap.Length - 1)];
    }

    /// <summary>Đo <paramref name="soLan"/> lần chạy <paramref name="viec"/> tuần tự, trả mili giây từng lần.</summary>
    public static async Task<List<double>> DoAsync(int soLan, Func<int, Task> viec)
    {
        var ketQua = new List<double>(soLan);
        for (var i = 0; i < soLan; i++)
        {
            var dongHo = Stopwatch.StartNew();
            await viec(i);
            ketQua.Add(dongHo.Elapsed.TotalMilliseconds);
        }

        return ketQua;
    }

    /// <summary>Ghi một dòng số đo vào tệp trong biến <c>DVC_KETQUA_DO</c> (không có biến thì bỏ qua) để tester đưa vào test.md.</summary>
    public static void Ghi(string nhan, IReadOnlyList<double> mau)
    {
        var tep = Environment.GetEnvironmentVariable("DVC_KETQUA_DO");
        if (string.IsNullOrWhiteSpace(tep))
        {
            return;
        }

        var dong = string.Create(
            CultureInfo.InvariantCulture,
            $"{nhan}\tn={mau.Count}\tp50={PhanVi(mau, 50):F1}\tp95={PhanVi(mau, 95):F1}\tmax={mau.Max():F1}\n");
        File.AppendAllText(tep, dong);
    }
}
