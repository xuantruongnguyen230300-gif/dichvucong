using DichVuCong.Data;
using DichVuCong.Data.Mau;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace DichVuCong.Tests.Integration;

/// <summary>
/// DB PostgreSQL riêng cho một lớp test (plan F00 §9.10): tên ngẫu nhiên, chạy migration, xoá khi xong.
/// Chuỗi kết nối quản trị lấy từ biến môi trường <see cref="BienMoiTruong"/>; không có biến thì <see cref="Co"/> = false
/// và các test gọi <see cref="CanCoDb"/> được bỏ qua (không đỏ).
/// </summary>
public sealed class DbThuNghiem : IAsyncLifetime
{
    public const string BienMoiTruong = "ConnectionStrings__DichVuCongTest";

    private string? _quanTri;
    private string? _tenDb;

    /// <summary>Chuỗi kết nối tới DB thử riêng của lớp này. Null khi không có biến môi trường.</summary>
    public string? ChuoiKetNoi { get; private set; }

    public bool Co => ChuoiKetNoi is not null;

    public async ValueTask InitializeAsync()
    {
        var bien = Environment.GetEnvironmentVariable(BienMoiTruong);
        if (string.IsNullOrWhiteSpace(bien))
        {
            return;
        }

        _quanTri = bien;
        _tenDb = "dichvucong_thu_" + Guid.NewGuid().ToString("N")[..12];

        await using (var conn = new NpgsqlConnection(_quanTri))
        {
            await conn.OpenAsync(TestContext.Current.CancellationToken);
            await using var lenh = conn.CreateCommand();
            // Tên DB do mã tự sinh (chữ thường + số), không có dữ liệu ngoài.
#pragma warning disable CA2100
            lenh.CommandText = $"CREATE DATABASE \"{_tenDb}\"";
#pragma warning restore CA2100
            await lenh.ExecuteNonQueryAsync(TestContext.Current.CancellationToken);
        }

        var rieng = new NpgsqlConnectionStringBuilder(_quanTri) { Database = _tenDb, Pooling = true };
        ChuoiKetNoi = rieng.ConnectionString;

        await using var db = TaoDbContext();
        await db.Database.MigrateAsync(TestContext.Current.CancellationToken);
    }

    public async ValueTask DisposeAsync()
    {
        if (_quanTri is null || _tenDb is null)
        {
            return;
        }

        NpgsqlConnection.ClearAllPools();
        await using var conn = new NpgsqlConnection(_quanTri);
        await conn.OpenAsync();
        await using var lenh = conn.CreateCommand();
#pragma warning disable CA2100
        lenh.CommandText = $"DROP DATABASE IF EXISTS \"{_tenDb}\" WITH (FORCE)";
#pragma warning restore CA2100
        await lenh.ExecuteNonQueryAsync();
    }

    /// <summary>Bỏ qua test (không đỏ) khi không có DB thử.</summary>
    public void CanCoDb() => Assert.SkipUnless(Co, $"Không có biến môi trường {BienMoiTruong}: bỏ qua test cần PostgreSQL.");

    public AppDbContext TaoDbContext()
    {
        var chuoi = ChuoiKetNoi ?? throw new InvalidOperationException("Chưa có DB thử.");
        var tuyChon = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(chuoi)
            .UseSnakeCaseNamingConvention()
            .Options;
        return new AppDbContext(tuyChon);
    }

    /// <summary>Xoá sạch mọi bảng nhập và bảng câu chưa trả lời (theo thứ tự khoá ngoại).</summary>
    public void XoaHet()
    {
        using var db = TaoDbContext();
        db.CauHoiMauCachHois.ExecuteDelete();
        db.CauHoiMaus.ExecuteDelete();
        db.ThuTucs.ExecuteDelete();
        db.PhanCongLinhVucs.ExecuteDelete();
        db.LinhVucs.ExecuteDelete();
        db.NhanSus.ExecuteDelete();
        db.TrungTams.ExecuteDelete();
        db.GioLamViecs.ExecuteDelete();
        db.LienKets.ExecuteDelete();
        db.ODichVus.ExecuteDelete();
        db.ChuDeGoiYs.ExecuteDelete();
        db.TuDongNghias.ExecuteDelete();
        db.VietTats.ExecuteDelete();
        db.LanNhaps.ExecuteDelete();
        db.CauChuaTraLois.ExecuteDelete();
    }

    /// <summary>Xoá sạch rồi chèn nội dung <paramref name="tep"/> bằng <see cref="AppDbContext"/>. Làm đối tượng của <paramref name="tep"/> dính khoá EF: dùng bản đọc riêng cho DB.</summary>
    public void Nap(TepDuLieuMau tep, bool kemLanNhap = true)
    {
        ArgumentNullException.ThrowIfNull(tep);

        XoaHet();
        tep.KiemTraVaNoi();
        using var db = TaoDbContext();
        db.LinhVucs.AddRange(tep.LinhVuc);
        db.ThuTucs.AddRange(tep.ThuTuc);
        db.PhanCongLinhVucs.AddRange(tep.PhanCongLinhVuc);
        db.NhanSus.AddRange(tep.NhanSu);
        if (tep.TrungTam is not null)
        {
            db.TrungTams.Add(tep.TrungTam);
        }

        db.GioLamViecs.AddRange(tep.GioLamViec);
        db.LienKets.AddRange(tep.LienKet);
        db.ODichVus.AddRange(tep.ODichVu);
        db.CauHoiMaus.AddRange(tep.CauHoiMau);
        db.CauHoiMauCachHois.AddRange(tep.CauHoiMauCachHoi);
        db.ChuDeGoiYs.AddRange(tep.ChuDeGoiY);
        db.TuDongNghias.AddRange(tep.TuDongNghia);
        db.VietTats.AddRange(tep.VietTat);
        if (kemLanNhap)
        {
            db.LanNhaps.AddRange(tep.LanNhap);
        }

        db.SaveChanges();
    }

    /// <summary>Một <see cref="IServiceProvider"/> theo nguồn PostgreSql (đường <c>AddDichVuCongData</c> thật). Người gọi giải phóng.</summary>
    public ServiceProvider TaoDichVu()
    {
        var chuoi = ChuoiKetNoi ?? throw new InvalidOperationException("Chưa có DB thử.");
        var services = new ServiceCollection();
        services.AddDichVuCongData(chuoi);
        return services.BuildServiceProvider();
    }
}
