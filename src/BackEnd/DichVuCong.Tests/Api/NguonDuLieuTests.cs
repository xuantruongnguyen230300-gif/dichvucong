using System.Collections.Concurrent;
using System.Globalization;
using System.Net;
using System.Text.Json;
using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Common.Hosting;
using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Api.Features.ThongTinTrungTam;
using DichVuCong.Data;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace DichVuCong.Tests.Api;

// Các factory cấu hình sai: mỗi lớp một ca của AC-26 / plan F00 §9.2.
public sealed class KhongKhaiNguonFactory : ApiFactory
{
    protected override string? NguonDuLieu => null;
}

public sealed class KhongKhaiNguonDevelopmentFactory : ApiFactory
{
    protected override string EnvironmentName => "Development";

    protected override string? NguonDuLieu => null;
}

public sealed class NguonSaiFactory(string giaTri) : ApiFactory
{
    protected override string? NguonDuLieu => giaTri;
}

public sealed class PostgreSqlThieuChuoiKetNoiFactory : ApiFactory
{
    protected override string? NguonDuLieu => "PostgreSql";
}

public sealed class MauCoChuoiKetNoiFactory : ApiFactory
{
    protected override string? ChuoiKetNoi => ChuoiKetNoiGia;
}

/// <summary>Bản dựng thật (Production) của nguồn Mẫu, kèm web root có index.html và dac-ta-trang.json như bản build FE.</summary>
public sealed class MauThatFactory : ApiFactory
{
    public const string Json = """
        {
          "mauTieuDe": "{{trang}} – {{trungTam}}",
          "khongTimThay": { "ten": "Không tìm thấy trang", "moTa": "Không tìm thấy trang bạn cần." },
          "trang": { "/": { "ten": "Trang chủ", "moTa": "Mô tả trang chủ." } }
        }
        """;

    public ConcurrentQueue<(LogLevel Muc, string NoiDung)> Log { get; } = new();

    protected override string? IndexHtml =>
        "<!doctype html><html lang=\"vi\"><head>\n<!--dac-ta-->\n<title>Mặc định</title>\n<!--/dac-ta-->\n</head><body></body></html>";

    protected override string? DacTaTrangJson => Json;

    protected override string? AllowedHosts => "localhost";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureLogging(logging => logging.AddProvider(new HangDoiLog(Log)));
    }
}

public sealed class DuLieuOptionsTests
{
    private static IConfiguration CauHinh(string? nguon, string? chuoiKetNoi = null)
    {
        var du = new Dictionary<string, string?>();
        if (nguon is not null)
        {
            du["DuLieu:Nguon"] = nguon;
        }

        if (chuoiKetNoi is not null)
        {
            du["ConnectionStrings:DichVuCong"] = chuoiKetNoi;
        }

        return new ConfigurationBuilder().AddInMemoryCollection(du).Build();
    }

    [Theory]
    [InlineData("Mau", LoaiNguonDuLieu.Mau)]
    [InlineData("PostgreSql", LoaiNguonDuLieu.PostgreSql)]
    public void Gia_tri_hop_le_duoc_nhan(string nguon, LoaiNguonDuLieu mongDoi) =>
        Assert.Equal(mongDoi, DuLieuOptions.DocNguon(CauHinh(nguon)));

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("  ")]
    [InlineData("Postgres")]
    [InlineData("mau")]
    [InlineData("postgresql")]
    [InlineData("MAU")]
    public void Thieu_hoac_sai_thi_bao_ten_muc_va_hai_gia_tri_hop_le_khong_chep_gia_tri(string? nguon)
    {
        var loi = Assert.Throws<InvalidOperationException>(() => DuLieuOptions.DocNguon(CauHinh(nguon)));

        Assert.Contains("DuLieu:Nguon", loi.Message, StringComparison.Ordinal);
        Assert.Contains("Mau", loi.Message, StringComparison.Ordinal);
        Assert.Contains("PostgreSql", loi.Message, StringComparison.Ordinal);
        if (!string.IsNullOrWhiteSpace(nguon))
        {
            Assert.DoesNotContain($"'{nguon}'", loi.Message, StringComparison.Ordinal);
        }
    }

    [Theory]
    [InlineData(null)]
    [InlineData("Postgres")]
    public void Cau_hinh_sai_thi_chua_dang_ky_gi_ca(string? nguon)
    {
        var services = new ServiceCollection();

        Assert.Throws<InvalidOperationException>(() => services.AddNguonDuLieu(CauHinh(nguon)));

        Assert.Empty(services);
    }

    [Fact]
    public void PostgreSql_thieu_chuoi_ket_noi_thi_neu_ten_khoa_va_khong_dang_ky_nguon_nao()
    {
        var services = new ServiceCollection();

        var loi = Assert.Throws<InvalidOperationException>(() => services.AddNguonDuLieu(CauHinh("PostgreSql")));

        Assert.Contains("ConnectionStrings:DichVuCong", loi.Message, StringComparison.Ordinal);
        Assert.DoesNotContain(services, d => d.ServiceType == typeof(INguonDuLieu) || d.ServiceType == typeof(AppDbContext));
    }

    [Fact]
    public void PostgreSql_loi_thieu_chuoi_ket_noi_khong_in_gia_tri()
    {
        // Chuỗi trống là thiếu; thông báo chỉ có tên khoá.
        var loi = Assert.Throws<InvalidOperationException>(() => new ServiceCollection().AddNguonDuLieu(CauHinh("PostgreSql", "  ")));

        Assert.DoesNotContain("BI-MAT", loi.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Mau_khong_can_chuoi_ket_noi_va_khong_dang_ky_AppDbContext()
    {
        var services = new ServiceCollection();

        var nguon = services.AddNguonDuLieu(CauHinh("Mau"));

        Assert.Equal(LoaiNguonDuLieu.Mau, nguon);
        Assert.Contains(services, d => d.ServiceType == typeof(INguonDuLieu) && d.ImplementationType == typeof(NguonDuLieuMau));
        Assert.DoesNotContain(services, d => d.ServiceType == typeof(AppDbContext));
    }

    [Fact]
    public void Mau_bo_qua_chuoi_ket_noi_neu_co()
    {
        var services = new ServiceCollection();

        services.AddNguonDuLieu(CauHinh("Mau", ApiFactory.ChuoiKetNoiGia));

        Assert.DoesNotContain(services, d => d.ServiceType == typeof(AppDbContext));
    }

    [Fact]
    public void PostgreSql_dang_ky_AppDbContext_va_nguon_scoped()
    {
        var services = new ServiceCollection();

        var nguon = services.AddNguonDuLieu(CauHinh("PostgreSql", ApiFactory.ChuoiKetNoiGia));

        Assert.Equal(LoaiNguonDuLieu.PostgreSql, nguon);
        var mo = Assert.Single(services, d => d.ServiceType == typeof(INguonDuLieu));
        Assert.Equal(typeof(NguonDuLieuPostgreSql), mo.ImplementationType);
        Assert.Equal(ServiceLifetime.Scoped, mo.Lifetime);
        Assert.Contains(services, d => d.ServiceType == typeof(AppDbContext));
    }
}

/// <summary>AC-26: bản dựng như triển khai (Production, đọc appsettings.json thật), ba cách khai chế độ dữ liệu.</summary>
public sealed class CheDoDuLieuKhoiDongTests
{
    [Fact]
    public void Production_khong_khai_thi_khong_khoi_dong_va_neu_ten_muc()
    {
        using var factory = new KhongKhaiNguonFactory();

        var loi = Assert.Throws<InvalidOperationException>(() => factory.CreateClient());

        Assert.Contains("DuLieu:Nguon", loi.Message, StringComparison.Ordinal);
        Assert.Contains("PostgreSql", loi.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Appsettings_that_khong_co_muc_DuLieu()
    {
        var duong = Path.Combine(TimThuMucApi(), "appsettings.json");
        using var json = JsonDocument.Parse(File.ReadAllText(duong));

        Assert.False(json.RootElement.TryGetProperty("DuLieu", out _));
    }

    [Fact]
    public void Development_khong_khai_cung_khong_khoi_dong()
    {
        using var factory = new KhongKhaiNguonDevelopmentFactory();

        var loi = Assert.Throws<InvalidOperationException>(() => factory.CreateClient());

        Assert.Contains("DuLieu:Nguon", loi.Message, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("Postgres")]
    [InlineData("mau")]
    public void Gia_tri_sai_thi_khong_khoi_dong(string giaTri)
    {
        using var factory = new NguonSaiFactory(giaTri);

        var loi = Assert.Throws<InvalidOperationException>(() => factory.CreateClient());

        Assert.Contains("DuLieu:Nguon", loi.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void PostgreSql_thieu_chuoi_ket_noi_thi_khong_khoi_dong()
    {
        using var factory = new PostgreSqlThieuChuoiKetNoiFactory();

        var loi = Assert.Throws<InvalidOperationException>(() => factory.CreateClient());

        Assert.Contains("ConnectionStrings:DichVuCong", loi.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Khai_Mau_khoi_dong_khong_chuoi_ket_noi_va_phuc_vu_trung_tam()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync("/api/trung-tam", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.IsType<NguonDuLieuMau>(factory.Services.GetRequiredService<INguonDuLieu>());
        Assert.Null(factory.Services.GetService<AppDbContext>());
    }

    [Fact]
    public async Task Khai_Mau_co_chuoi_ket_noi_van_khong_co_AppDbContext()
    {
        await using var factory = new MauCoChuoiKetNoiFactory();
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync("/health/ready", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(factory.Services.GetService<AppDbContext>());
    }

    [Fact]
    public async Task Khai_PostgreSql_voi_chuoi_ket_noi_gia_khoi_dong_va_ready_503()
    {
        await using var factory = new PostgreSqlApiFactory();
        using var client = factory.CreateHttpsClient();

        using var live = await client.GetAsync("/health/live", TestContext.Current.CancellationToken);
        using var ready = await client.GetAsync("/health/ready", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, live.StatusCode);
        Assert.Equal(HttpStatusCode.ServiceUnavailable, ready.StatusCode);
        using var pham = factory.Services.CreateScope();
        Assert.IsType<NguonDuLieuPostgreSql>(pham.ServiceProvider.GetRequiredService<INguonDuLieu>());
        Assert.IsType<KhoCauChuaTraLoiPostgreSql>(pham.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>());
    }

    /// <summary>AC-25: cùng bản dựng, đổi cấu hình thì đổi nguồn, không sửa chương trình.</summary>
    [Fact]
    public async Task Doi_cau_hinh_doi_nguon_trong_cung_ban_dung()
    {
        await using var mau = new ApiFactory();
        await using var pg = new PostgreSqlApiFactory();
        using var khachMau = mau.CreateHttpsClient();
        using var khachPg = pg.CreateHttpsClient();

        using var readyMau = await khachMau.GetAsync("/health/ready", TestContext.Current.CancellationToken);
        using var readyPg = await khachPg.GetAsync("/health/ready", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, readyMau.StatusCode);
        Assert.Equal(HttpStatusCode.ServiceUnavailable, readyPg.StatusCode);
        Assert.IsType<KhoCauChuaTraLoiMau>(mau.Services.GetRequiredService<IKhoCauChuaTraLoi>());
        Assert.NotNull(pg.Services.GetService<AppDbContext>());
        Assert.Null(mau.Services.GetService<AppDbContext>());
    }

    [Fact]
    public async Task Log_khoi_dong_neu_nguon_Mau_kem_phien_ban_thoi_diem_so_thu_tuc_khong_co_chuoi_ket_noi()
    {
        await using var factory = new MauThatFactory();
        using var client = factory.CreateHttpsClient();
        using var response = await client.GetAsync("/health/live", TestContext.Current.CancellationToken);

        var tep = TepDuLieuMau.Nhung;
        var dong = Assert.Single(factory.Log, l => l.NoiDung.StartsWith("Nguồn dữ liệu:", StringComparison.Ordinal));
        Assert.Equal(LogLevel.Information, dong.Muc);
        Assert.Contains("Mau", dong.NoiDung, StringComparison.Ordinal);
        Assert.Contains(tep.ThuTuc.Count.ToString(CultureInfo.InvariantCulture) + " thủ tục", dong.NoiDung, StringComparison.Ordinal);
        Assert.Contains(tep.ThoiDiem.ToString("O", CultureInfo.InvariantCulture), dong.NoiDung, StringComparison.Ordinal);
        Assert.DoesNotContain(factory.Log, l => l.NoiDung.Contains("BI-MAT-KET-NOI", StringComparison.Ordinal));
    }

    [Fact]
    public async Task Log_khoi_dong_nguon_PostgreSql_khong_lo_chuoi_ket_noi()
    {
        var log = new ConcurrentQueue<(LogLevel, string)>();
        await using var factory = new PostgreSqlLogFactory(log);
        using var client = factory.CreateHttpsClient();
        using var response = await client.GetAsync("/health/ready", TestContext.Current.CancellationToken);

        Assert.Contains(log, l => l.Item2 == "Nguồn dữ liệu: PostgreSql.");
        Assert.DoesNotContain(log, l => l.Item2.Contains("BI-MAT-KET-NOI", StringComparison.Ordinal)
            || l.Item2.Contains("Password=", StringComparison.Ordinal)
            || l.Item2.Contains("Host=khong-co-may-nay", StringComparison.Ordinal));
    }

    private static string TimThuMucApi()
    {
        for (var thuMuc = new DirectoryInfo(AppContext.BaseDirectory); thuMuc is not null; thuMuc = thuMuc.Parent)
        {
            var api = Path.Combine(thuMuc.FullName, "DichVuCong.Api", "appsettings.json");
            if (File.Exists(api))
            {
                return Path.GetDirectoryName(api)!;
            }
        }

        throw new InvalidOperationException("Không thấy thư mục DichVuCong.Api.");
    }

    private sealed class PostgreSqlLogFactory(ConcurrentQueue<(LogLevel, string)> log) : PostgreSqlApiFactory
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            base.ConfigureWebHost(builder);
            builder.ConfigureLogging(logging => logging.AddProvider(new HangDoiLog(log)));
        }
    }
}

/// <summary>AC-24: khởi động không có DB, dữ liệu là file nhúng thật; không dựng service giả.</summary>
public sealed class DuLieuMauNhungApiTests(MauThatFactory factory) : IClassFixture<MauThatFactory>
{
    private static readonly string[] TruongTrungTam =
    [
        "banDo", "chucVuNguoiChiuTrachNhiem", "coQuanChuQuan", "diaChi", "dienThoai", "email", "ghiChuNgayNghi",
        "gioLamViec", "lienKet", "mangXaHoi", "ngayCapNhatThuTuc", "nguoiChiuTrachNhiem", "oDichVu", "ten", "tinh", "xa",
    ];

    private static async Task<JsonDocument> DocJsonAsync(HttpResponseMessage response) =>
        JsonDocument.Parse(await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));

    [Fact]
    public async Task Trung_tam_200_du_muc_chan_trang_khong_co_truong_bao_nguon()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync("/api/trung-tam", TestContext.Current.CancellationToken);
        using var json = await DocJsonAsync(response);
        var goc = json.RootElement;

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("cangiuoc@tayninh.gov.vn", goc.GetProperty("email").GetString());
        var oDichVu = goc.GetProperty("oDichVu");
        Assert.Equal(6, oDichVu.GetArrayLength());
        Assert.Equal(2, oDichVu.EnumerateArray().Count(o => o.GetProperty("url").ValueKind == JsonValueKind.Null));
        Assert.All(oDichVu.EnumerateArray(), o => Assert.Equal(["bieuTuong", "ten", "url"], o.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal).ToArray()));
        Assert.Equal(3, goc.GetProperty("lienKet").GetArrayLength());
        Assert.Equal(5, goc.GetProperty("gioLamViec").GetArrayLength());
        Assert.Equal(TruongTrungTam, goc.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal).ToArray());
    }

    [Fact]
    public async Task Ngay_cap_nhat_la_ngay_Viet_Nam_cua_thoi_diem_trong_file()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync("/api/trung-tam", TestContext.Current.CancellationToken);
        using var json = await DocJsonAsync(response);

        var mongDoi = ThongTinTrungTamService.NgayVietNam(TepDuLieuMau.Nhung.ThoiDiem)
            .ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        Assert.Equal(mongDoi, json.RootElement.GetProperty("ngayCapNhatThuTuc").GetString());
    }

    [Fact]
    public async Task ETag_chua_UtcTicks_cua_file_va_If_None_Match_tra_304()
    {
        using var client = factory.CreateHttpsClient();

        using var dau = await client.GetAsync("/api/trung-tam", TestContext.Current.CancellationToken);
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, "/api/trung-tam");
        yeuCau.Headers.IfNoneMatch.Add(dau.Headers.ETag!);
        using var sau = await client.SendAsync(yeuCau, TestContext.Current.CancellationToken);

        Assert.Contains(
            TepDuLieuMau.Nhung.ThoiDiem.UtcTicks.ToString(CultureInfo.InvariantCulture),
            dau.Headers.ETag!.Tag,
            StringComparison.Ordinal);
        Assert.Equal(HttpStatusCode.NotModified, sau.StatusCode);
    }

    [Fact]
    public async Task Phien_ban_du_lieu_la_thoi_diem_cua_file()
    {
        using var pham = factory.Services.CreateScope();

        var phienBan = await pham.ServiceProvider.GetRequiredService<IPhienBanDuLieu>().LayAsync(TestContext.Current.CancellationToken);

        Assert.Equal(TepDuLieuMau.Nhung.ThoiDiem.UtcTicks, phienBan);
    }

    [Fact]
    public async Task Health_ready_200()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync("/health/ready", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Tim_thu_tuc_1_001193_mo_chi_tiet_va_linh_vuc_co_trong_nguon()
    {
        // F03–F05 chưa có endpoint: kiểm ở lớp nguồn mà các endpoint đó sẽ dùng, trên host thật không DB.
        using var pham = factory.Services.CreateScope();
        var nguon = pham.ServiceProvider.GetRequiredService<INguonDuLieu>();
        var ct = TestContext.Current.CancellationToken;

        var thuTuc = await nguon.ThuTucs
            .Where(t => t.Ma == "1.001193")
            .Select(t => new { t.Ma, t.Ten, t.LinhVucMa, SoTrinhTu = t.TrinhTu.Count })
            .DauTienAsync(ct);
        var soLinhVuc = await nguon.LinhVucs.DemAsync(ct);
        var tenLinhVuc = await nguon.LinhVucs
            .Where(l => thuTuc != null && l.Ma == thuTuc.LinhVucMa)
            .Select(l => l.Ten)
            .DauTienAsync(ct);

        Assert.NotNull(thuTuc);
        Assert.False(string.IsNullOrWhiteSpace(thuTuc.Ten));
        Assert.True(thuTuc.SoTrinhTu > 0);
        Assert.Equal(75, soLinhVuc);
        Assert.False(string.IsNullOrWhiteSpace(tenLinhVuc));
    }

    [Fact]
    public async Task Html_trang_chu_giong_chay_that_khong_chu_chay_thu_khong_chu_du_lieu_mau()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync("/", TestContext.Current.CancellationToken);
        var html = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.DoesNotContain("chạy thử", html, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("dữ liệu mẫu", html, StringComparison.OrdinalIgnoreCase);
        var ngay = ThongTinTrungTamService.NgayVietNam(TepDuLieuMau.Nhung.ThoiDiem)
            .ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        Assert.Contains($"<meta name=\"DC.date\" content=\"{ngay}\">", html, StringComparison.Ordinal);
        foreach (var yeuTo in new[] { "DC.title", "DC.description", "DC.creator", "DC.publisher", "DC.identifier", "DC.language" })
        {
            Assert.Contains($"name=\"{yeuTo}\"", html, StringComparison.Ordinal);
        }
    }

    [Fact]
    public async Task Json_trung_tam_chi_co_nhan_du_lieu_mau_o_nguoi_chiu_trach_nhiem()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync("/api/trung-tam", TestContext.Current.CancellationToken);
        var van = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        using var json = JsonDocument.Parse(van);

        Assert.DoesNotContain("chạy thử", van, StringComparison.OrdinalIgnoreCase);
        var chua = json.RootElement.EnumerateObject()
            .Where(p => p.Value.ToString().Contains("dữ liệu mẫu", StringComparison.OrdinalIgnoreCase))
            .Select(p => p.Name)
            .ToArray();
        Assert.Equal(["nguoiChiuTrachNhiem"], chua);
    }
}

internal sealed class HangDoiLog(ConcurrentQueue<(LogLevel, string)> hangDoi) : ILoggerProvider
{
    public ILogger CreateLogger(string categoryName) => new Logger(hangDoi);

    public void Dispose()
    {
    }

    private sealed class Logger(ConcurrentQueue<(LogLevel, string)> hangDoi) : ILogger
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception,
            Func<TState, Exception?, string> formatter) =>
            hangDoi.Enqueue((logLevel, formatter(state, exception) + (exception?.ToString() ?? string.Empty)));
    }
}
