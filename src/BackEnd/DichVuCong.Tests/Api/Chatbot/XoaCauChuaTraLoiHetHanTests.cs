using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Data;
using DichVuCong.Data.DuLieu;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>
/// Việc định kỳ xoá câu chưa trả lời quá 90 ngày (F01 T18, F00 T28, plan F00 §9.6, F06 BR-12), chạy trên cả hai kho.
/// Không cần PostgreSQL: <see cref="DbGiaLap"/> chặn kết nối và câu lệnh. Chạy với DB thật: <c>Tests/Integration/Chatbot/</c> (tester).
/// </summary>
public sealed class XoaCauChuaTraLoiHetHanTests
{
    private static readonly DateTimeOffset BayGio = new(2026, 10, 12, 8, 0, 0, TimeSpan.Zero);

    private static readonly string TenLogger = typeof(XoaCauChuaTraLoiHetHan).FullName!;

    /// <summary>
    /// Ghi một câu rồi để (ngày, giây) trôi qua và chạy một lượt xoá trên kho Mẫu → còn lại bao nhiêu dòng?
    /// Đúng 90 ngày thì còn giữ (lan_gap_cuoi &lt; bây giờ − 90 ngày).
    /// </summary>
    [Theory]
    [InlineData(0, 0, 1)]
    [InlineData(89, 0, 1)]
    [InlineData(89, 86_399, 1)]
    [InlineData(90, 0, 1)]
    [InlineData(90, 1, 0)]
    [InlineData(91, 0, 0)]
    [InlineData(365, 0, 0)]
    public async Task Kho_Mau_qua_han_khi_lan_gap_cuoi_cu_hon_90_ngay(int ngay, int giay, int soDongConLai)
    {
        var ct = TestContext.Current.CancellationToken;
        var dongHo = new DongHoGia(BayGio);
        using var log = new BoGhiLog(TenLogger);
        await using var dichVu = TaoDichVuMau(log, dongHo);
        var kho = (KhoCauChuaTraLoiMau)dichVu.GetRequiredService<IKhoCauChuaTraLoi>();
        await kho.GhiAsync("Đăng ký khai sinh?", ct);

        dongHo.TienToi(TimeSpan.FromDays(ngay) + TimeSpan.FromSeconds(giay));
        await LayViec(dichVu).XoaMotLuotAsync(ct);

        Assert.Equal(soDongConLai, kho.ChupCacDong().Count);
        var dong = await log.DocAsync();
        Assert.Equal(LogLevel.Information, dong.MucDo);
        Assert.Equal(1 - soDongConLai, Assert.IsType<int>(dong.ThuocTinh["SoDong"]));
    }

    [Fact]
    public async Task Moc_dung_90_ngay_chi_xoa_dong_cu_hon_giu_dong_moi_hon()
    {
        var ct = TestContext.Current.CancellationToken;
        var dongHo = new DongHoGia(BayGio);
        using var log = new BoGhiLog(TenLogger);
        await using var dichVu = TaoDichVuMau(log, dongHo);
        var kho = (KhoCauChuaTraLoiMau)dichVu.GetRequiredService<IKhoCauChuaTraLoi>();
        await kho.GhiAsync("cau cu", ct);
        dongHo.TienToi(TimeSpan.FromSeconds(1));
        await kho.GhiAsync("cau dung moc", ct);
        dongHo.TienToi(TimeSpan.FromDays(90) - TimeSpan.FromSeconds(1));
        await kho.GhiAsync("cau moi", ct);

        // Bây giờ = lần gặp đầu + 90 ngày + 1 giây → mốc = lần gặp của "cau dung moc": dòng đó đúng mốc nên còn giữ, dòng đầu cũ hơn nên bị xoá.
        dongHo.TienToi(TimeSpan.FromSeconds(1));
        await LayViec(dichVu).XoaMotLuotAsync(ct);

        Assert.Equal(["cau dung moc", "cau moi"], kho.ChupCacDong().Select(c => c.NoiDung));
    }

    [Fact]
    public async Task Kho_PostgreSql_mot_luot_la_mot_cau_DELETE_tham_so_hoa_moc_bay_gio_tru_90_ngay()
    {
        var db = new DbGiaLap { SoDongXoa = 3 };
        using var log = new BoGhiLog(TenLogger);
        await using var dichVu = TaoDichVuPostgreSql(db, log);

        await LayViec(dichVu).XoaMotLuotAsync(TestContext.Current.CancellationToken);

        var lenh = Assert.Single(db.CacLenh);
        Assert.StartsWith("DELETE FROM cau_chua_tra_loi", lenh.Sql, StringComparison.Ordinal);
        Assert.Contains("lan_gap_cuoi <", lenh.Sql, StringComparison.Ordinal);
        Assert.DoesNotContain(';', lenh.Sql);
        Assert.Equal(BayGio.AddDays(-90), Assert.IsType<DateTimeOffset>(Assert.Single(lenh.ThamSo)));

        var dong = await log.DocAsync();
        Assert.Equal(LogLevel.Information, dong.MucDo);
        Assert.Equal(3, Assert.IsType<int>(dong.ThuocTinh["SoDong"]));
        Assert.False(log.ConDongChuaDoc);
    }

    [Fact]
    public async Task Kho_PostgreSql_loi_DB_chi_ghi_Warning_khong_nem_loi()
    {
        var db = new DbGiaLap { MatKetNoi = true };
        using var log = new BoGhiLog(TenLogger);
        await using var dichVu = TaoDichVuPostgreSql(db, log);

        await LayViec(dichVu).XoaMotLuotAsync(TestContext.Current.CancellationToken);

        Assert.Empty(db.CacLenh);
        var dong = await log.DocAsync();
        Assert.Equal(LogLevel.Warning, dong.MucDo);
        Assert.Null(dong.Loi);
        Assert.DoesNotContain(DbGiaLap.MayChuGia, dong.NoiDung, StringComparison.Ordinal);
        Assert.DoesNotContain("10.1.2.3", dong.NoiDung, StringComparison.Ordinal);
        Assert.Equal("SocketException", dong.ThuocTinh["LoaiLoi"]);
        Assert.Equal("ConnectionRefused", dong.ThuocTinh["MaLoi"]);
        Assert.False(log.ConDongChuaDoc);
    }

    [Fact]
    public async Task Chay_luc_khoi_dong_roi_moi_gio_loi_thi_luot_sau_thu_lai()
    {
        var ct = TestContext.Current.CancellationToken;
        var kho = new KhoGia { Loi = true, SoDongXoa = 2 };
        var dongHo = new DongHoGia(BayGio);
        using var log = new BoGhiLog(TenLogger);
        await using var dichVu = TaoDichVuMau(log, dongHo, kho);
        var viec = LayViec(dichVu);

        // Lượt lúc khởi động gặp lỗi kho: chỉ ghi Warning, việc định kỳ vẫn sống.
        await viec.StartAsync(ct);
        var canhBao = await log.DocAsync();
        Assert.Equal(LogLevel.Warning, canhBao.MucDo);
        Assert.Null(canhBao.Loi);
        Assert.Equal("InvalidOperationException", canhBao.ThuocTinh["LoaiLoi"]);
        var tac = viec.ExecuteTask;
        Assert.NotNull(tac);
        Assert.False(tac.IsCompleted);

        // Chưa đủ một giờ: chưa chạy lượt mới.
        kho.Loi = false;
        dongHo.TienToi(TimeSpan.FromMinutes(59));
        await Task.Delay(TimeSpan.FromMilliseconds(200), ct);
        Assert.False(log.ConDongChuaDoc);
        Assert.Empty(kho.CacMoc);

        // Đủ một giờ: lượt sau chạy lại, mốc tính theo giờ lúc chạy.
        dongHo.TienToi(TimeSpan.FromMinutes(1));
        var dong = await log.DocAsync();
        Assert.Equal(LogLevel.Information, dong.MucDo);
        Assert.Equal(2, Assert.IsType<int>(dong.ThuocTinh["SoDong"]));
        Assert.Equal(BayGio.AddHours(1).AddDays(-90), Assert.Single(kho.CacMoc));

        await viec.StopAsync(ct);
        Assert.False(tac.IsFaulted);
    }

    [Fact]
    public async Task Viec_dinh_ky_chay_tren_kho_Mau_khong_can_AppDbContext()
    {
        var ct = TestContext.Current.CancellationToken;
        var kho = new KhoGia { SoDongXoa = 5 };
        using var log = new BoGhiLog(TenLogger);
        await using var dichVu = TaoDichVuMau(log, new DongHoGia(BayGio), kho);

        await LayViec(dichVu).XoaMotLuotAsync(ct);

        Assert.Equal(BayGio.AddDays(-90), Assert.Single(kho.CacMoc));
        Assert.Null(dichVu.GetService<AppDbContext>());
    }

    [Fact]
    public void MoTaLoi_PostgresException_lay_SqlState_khong_lay_message()
    {
        var loi = new InvalidOperationException(
            "bọc " + DbGiaLap.MayChuGia, new PostgresException("host=" + DbGiaLap.MayChuGia, "ERROR", "ERROR", "57P03"));

        var (loai, ma) = XoaCauChuaTraLoiHetHan.MoTaLoi(loi);

        Assert.Equal("PostgresException", loai);
        Assert.Equal("57P03", ma);
    }

    [Fact]
    public void MoTaLoi_loi_khac_chi_co_ten_kieu()
    {
        var (loai, ma) = XoaCauChuaTraLoiHetHan.MoTaLoi(new TimeoutException("host " + DbGiaLap.MayChuGia));

        Assert.Equal("TimeoutException", loai);
        Assert.Equal("-", ma);
    }

    /// <summary>Nguồn Mẫu: không đăng ký DB. <paramref name="kho"/> khác null thì thay kho Mẫu bằng kho giả.</summary>
    private static ServiceProvider TaoDichVuMau(BoGhiLog log, DongHoGia dongHo, KhoGia? kho = null)
    {
        var services = new ServiceCollection();
        services.AddLogging(l => l.AddProvider(log));
        services.AddSingleton<TimeProvider>(dongHo);
        services.AddChatbot(LoaiNguonDuLieu.Mau);
        services.ThemPhuThuocTroLy();
        if (kho is not null)
        {
            services.Replace(ServiceDescriptor.Singleton<IKhoCauChuaTraLoi>(kho));
        }

        return services.BuildServiceProvider(new ServiceProviderOptions { ValidateOnBuild = true, ValidateScopes = true });
    }

    /// <summary>Đăng ký như API thật (<c>AddDichVuCongData</c> + <c>AddChatbot(PostgreSql)</c>), thêm DB giả và đồng hồ giả.</summary>
    private static ServiceProvider TaoDichVuPostgreSql(DbGiaLap db, BoGhiLog log, DongHoGia? dongHo = null)
    {
        var services = new ServiceCollection();
        services.AddLogging(l => l.AddProvider(log));
        services.AddSingleton<TimeProvider>(dongHo ?? new DongHoGia(BayGio));
        services.AddDichVuCongData("Host=khong-co-may-nay;Database=x;Username=x;Password=x");
        // DbContext dùng pool nên options là singleton; cấu hình thêm cũng phải singleton.
        services.ConfigureDbContext<AppDbContext>(o => o.AddInterceptors(db), ServiceLifetime.Singleton);
        services.AddSingleton(CauHinhGia.Tu());
        services.AddChatbot(LoaiNguonDuLieu.PostgreSql);
        services.ThemPhuThuocTroLy();

        return services.BuildServiceProvider(new ServiceProviderOptions { ValidateOnBuild = true, ValidateScopes = true });
    }

    private static XoaCauChuaTraLoiHetHan LayViec(IServiceProvider dichVu) =>
        Assert.Single(dichVu.GetServices<IHostedService>().OfType<XoaCauChuaTraLoiHetHan>());
}
