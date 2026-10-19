using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Data;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>
/// Kho câu chưa trả lời trong PostgreSQL (F00 T28, plan §9.6). Không cần PostgreSQL: <see cref="DbGiaLap"/> ghi lại câu lệnh.
/// Gộp thật bằng <c>ON CONFLICT</c> chạy với DB thật: <c>Tests/Integration/Chatbot/</c> (tester).
/// </summary>
public sealed class KhoCauChuaTraLoiPostgreSqlTests
{
    private static readonly DateTimeOffset BayGio = new(2026, 10, 12, 8, 0, 0, TimeSpan.Zero);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Ghi_la_mot_cau_INSERT_ON_CONFLICT_khoa_gop_tham_so_hoa()
    {
        var db = new DbGiaLap();
        await using var dichVu = TaoDichVu(db);
        await using var scope = dichVu.CreateAsyncScope();
        var kho = scope.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>();

        await kho.GhiAsync("Đăng ký khai sinh?", Ct);

        var lenh = Assert.Single(db.CacLenh);
        Assert.StartsWith("INSERT INTO cau_chua_tra_loi", lenh.Sql, StringComparison.Ordinal);
        Assert.Contains("ON CONFLICT (khoa_gop) DO UPDATE", lenh.Sql, StringComparison.Ordinal);
        Assert.Contains("so_lan_gap = cau_chua_tra_loi.so_lan_gap + 1", lenh.Sql, StringComparison.Ordinal);
        Assert.Contains("lan_gap_cuoi = EXCLUDED.lan_gap_cuoi", lenh.Sql, StringComparison.Ordinal);
        Assert.DoesNotContain(';', lenh.Sql);
        // Thứ tự giá trị trong câu: nội dung, khoá gộp, giờ, khoá gộp (kiểm câu đã có), trần số dòng.
        Assert.Equal(
            ["Đăng ký khai sinh?", "dang ky khai sinh?", BayGio, "dang ky khai sinh?", KhoCauChuaTraLoiOptions.SoDongMacDinh],
            lenh.ThamSo);
    }

    [Fact]
    public async Task Gia_tri_nam_trong_tham_so_khong_nam_trong_chuoi_SQL()
    {
        const string CauNguyHiem = "x'); DROP TABLE cau_chua_tra_loi;--";
        var db = new DbGiaLap();
        await using var dichVu = TaoDichVu(db);
        await using var scope = dichVu.CreateAsyncScope();
        var kho = scope.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>();

        await kho.GhiAsync(CauNguyHiem, Ct);

        var lenh = Assert.Single(db.CacLenh);
        Assert.DoesNotContain("DROP", lenh.Sql, StringComparison.Ordinal);
        Assert.Equal(CauNguyHiem, lenh.ThamSo[0]);
    }

    [Fact]
    public async Task XoaQuaHan_la_mot_cau_DELETE_tham_so_hoa_moc_tra_so_dong_da_xoa()
    {
        var db = new DbGiaLap { SoDongXoa = 4 };
        await using var dichVu = TaoDichVu(db);
        await using var scope = dichVu.CreateAsyncScope();
        var kho = scope.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>();
        var moc = BayGio.AddDays(-90);

        var soDong = await kho.XoaQuaHanAsync(moc, Ct);

        Assert.Equal(4, soDong);
        var lenh = Assert.Single(db.CacLenh);
        Assert.StartsWith("DELETE FROM cau_chua_tra_loi", lenh.Sql, StringComparison.Ordinal);
        Assert.Contains("lan_gap_cuoi <", lenh.Sql, StringComparison.Ordinal);
        Assert.Equal(moc, Assert.Single(lenh.ThamSo));
    }

    [Fact]
    public async Task Cau_dai_hon_500_ky_tu_nem_ArgumentOutOfRangeException_va_khong_gui_lenh()
    {
        var db = new DbGiaLap();
        await using var dichVu = TaoDichVu(db);
        await using var scope = dichVu.CreateAsyncScope();
        var kho = scope.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>();

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(
            () => kho.GhiAsync(new string('a', CauChuaTraLoi.DoDaiToiDa + 1), Ct));

        Assert.Empty(db.CacLenh);
    }

    [Fact]
    public async Task Cau_dai_dung_500_ky_tu_duoc_gui()
    {
        var db = new DbGiaLap();
        await using var dichVu = TaoDichVu(db);
        await using var scope = dichVu.CreateAsyncScope();
        var kho = scope.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>();

        await kho.GhiAsync(new string('a', CauChuaTraLoi.DoDaiToiDa), Ct);

        Assert.Single(db.CacLenh);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Cau_rong_nem_ArgumentException_va_khong_gui_lenh(string cau)
    {
        var db = new DbGiaLap();
        await using var dichVu = TaoDichVu(db);
        await using var scope = dichVu.CreateAsyncScope();
        var kho = scope.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>();

        await Assert.ThrowsAsync<ArgumentException>(() => kho.GhiAsync(cau, Ct));

        Assert.Empty(db.CacLenh);
    }

    /// <summary>Đầy kho thì câu mới bị bỏ, câu đã có vẫn được cộng: điều kiện nằm trong câu SQL, trần là tham số.</summary>
    [Fact]
    public async Task Ghi_co_tran_so_dong_mac_dinh_50000_trong_cau_SQL()
    {
        var db = new DbGiaLap();
        await using var dichVu = TaoDichVu(db);
        await using var scope = dichVu.CreateAsyncScope();
        var kho = scope.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>();

        await kho.GhiAsync("cau", Ct);

        var lenh = Assert.Single(db.CacLenh);
        Assert.Contains("WHERE EXISTS (SELECT 1 FROM cau_chua_tra_loi WHERE khoa_gop =", lenh.Sql, StringComparison.Ordinal);
        Assert.Contains("OR (SELECT count(*) FROM cau_chua_tra_loi) <", lenh.Sql, StringComparison.Ordinal);
        Assert.Equal(50_000, lenh.ThamSo[^1]);
        Assert.DoesNotContain("50000", lenh.Sql, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Tran_so_dong_lay_tu_cau_hinh()
    {
        var db = new DbGiaLap();
        await using var dichVu = TaoDichVu(db, CauHinhGia.Tu(("Chatbot:KhoCauChuaTraLoi:SoDongToiDa", "1234")));
        await using var scope = dichVu.CreateAsyncScope();
        var kho = scope.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>();

        await kho.GhiAsync("cau", Ct);

        Assert.Equal(1_234, Assert.Single(db.CacLenh).ThamSo[^1]);
    }

    [Theory]
    [InlineData("0")]
    [InlineData("-5")]
    [InlineData("10000001")]
    public async Task Tran_so_dong_ngoai_khoang_thi_bao_loi_cau_hinh(string giaTri)
    {
        var db = new DbGiaLap();
        await using var dichVu = TaoDichVu(db, CauHinhGia.Tu(("Chatbot:KhoCauChuaTraLoi:SoDongToiDa", giaTri)));

        Assert.Throws<OptionsValidationException>(() => dichVu.GetRequiredService<IOptions<KhoCauChuaTraLoiOptions>>().Value);
        await Task.CompletedTask;
    }

    /// <summary>NUL bị bỏ trước khi gửi (PostgreSQL không lưu được NUL), cả nội dung lẫn khoá gộp.</summary>
    [Fact]
    public async Task Ky_tu_NUL_bi_bo_khoi_noi_dung_va_khoa_gop()
    {
        var db = new DbGiaLap();
        await using var dichVu = TaoDichVu(db);
        await using var scope = dichVu.CreateAsyncScope();
        var kho = scope.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>();

        await kho.GhiAsync("Đăng\0 ký\0", Ct);

        var lenh = Assert.Single(db.CacLenh);
        Assert.Equal("Đăng ký", lenh.ThamSo[0]);
        Assert.Equal("dang ky", lenh.ThamSo[1]);
    }

    private static readonly string TenLogger = typeof(KhoCauChuaTraLoiPostgreSql).FullName!;

    /// <summary>Không dòng nào bị ảnh hưởng (DbGiaLap trả 0) = kho đầy: log Warning, không có nội dung câu hỏi, tối đa một dòng mỗi giờ.</summary>
    [Fact]
    public async Task Kho_day_ghi_canh_bao_mot_dong_moi_gio_khong_co_noi_dung_cau_hoi()
    {
        const string Cau = "câu riêng tư xyz";
        var db = new DbGiaLap { SoDongXoa = 0 };
        var dongHo = new DongHoGia(BayGio);
        using var log = new BoGhiLog(TenLogger);
        await using var dichVu = TaoDichVu(db, CauHinhGia.Tu(("Chatbot:KhoCauChuaTraLoi:SoDongToiDa", "1234")), log, dongHo);
        await using var scope = dichVu.CreateAsyncScope();
        var kho = scope.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>();

        await kho.GhiAsync(Cau, Ct);
        var dong = await log.DocAsync();
        await kho.GhiAsync(Cau + " 2", Ct);
        dongHo.TienToi(TimeSpan.FromMinutes(59));
        await kho.GhiAsync(Cau + " 3", Ct);

        Assert.Equal(LogLevel.Warning, dong.MucDo);
        Assert.Equal(1_234, dong.ThuocTinh["SoDongToiDa"]);
        Assert.DoesNotContain("riêng tư", dong.NoiDung, StringComparison.Ordinal);
        Assert.False(log.ConDongChuaDoc);

        dongHo.TienToi(TimeSpan.FromMinutes(2));
        await kho.GhiAsync(Cau + " 4", Ct);
        Assert.Equal(LogLevel.Warning, (await log.DocAsync()).MucDo);
        Assert.False(log.ConDongChuaDoc);
    }

    [Fact]
    public async Task Ghi_duoc_dong_thi_khong_canh_bao()
    {
        var db = new DbGiaLap { SoDongXoa = 1 };
        using var log = new BoGhiLog(TenLogger);
        await using var dichVu = TaoDichVu(db, log: log);
        await using var scope = dichVu.CreateAsyncScope();
        var kho = scope.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>();

        await kho.GhiAsync("cau", Ct);

        Assert.False(log.ConDongChuaDoc);
    }

    private static ServiceProvider TaoDichVu(DbGiaLap db, IConfiguration? cauHinh = null, BoGhiLog? log = null, TimeProvider? dongHo = null)
    {
        var services = new ServiceCollection();
        services.AddLogging(b =>
        {
            if (log is not null)
            {
                b.AddProvider(log);
            }
        });
        services.AddSingleton(dongHo ?? new DongHoGia(BayGio));
        services.AddDichVuCongData("Host=khong-co-may-nay;Database=x;Username=x;Password=x");
        services.ConfigureDbContext<AppDbContext>(o => o.AddInterceptors(db), ServiceLifetime.Singleton);
        services.AddSingleton(cauHinh ?? CauHinhGia.Tu());
        services.AddChatbot(LoaiNguonDuLieu.PostgreSql);
        services.ThemPhuThuocTroLy();

        return services.BuildServiceProvider(new ServiceProviderOptions { ValidateOnBuild = true, ValidateScopes = true });
    }
}
