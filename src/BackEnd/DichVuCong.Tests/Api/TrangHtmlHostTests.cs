using System.Net;
using DichVuCong.Api.Common.Errors;
using DichVuCong.Api.Common.Hosting;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Routing.Patterns;
using Microsoft.Extensions.Logging;

namespace DichVuCong.Tests.Api;

/// <summary>Chưa khai tên miền: Host của client không được dùng để dựng og:url, DC.identifier.</summary>
public sealed class TrangChuaKhaiTenMienFactory : TrangFactory
{
    protected override string? AllowedHosts => null;
}

public sealed class TrangKhaiSaoFactory : TrangFactory
{
    protected override string? AllowedHosts => "*";
}

public sealed class TrangHtmlHostTests
{
    private const string HostLa = "evil.example";

    private static async Task<(HttpStatusCode Ma, string Html)> LayAsync(ApiFactory factory, string duong, string? host = null)
    {
        using var client = factory.CreateHttpsClient();
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, new Uri(duong, UriKind.Relative));
        if (host is not null)
        {
            yeuCau.Headers.Host = host;
        }

        using var response = await client.SendAsync(yeuCau, TestContext.Current.CancellationToken);

        return (response.StatusCode, await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task DaKhaiTenMien_HostHopLe_CoOgUrlVaIdentifier()
    {
        await using var factory = new TrangFactory();

        var (ma, html) = await LayAsync(factory, "/thu-tuc");

        Assert.Equal(HttpStatusCode.OK, ma);
        Assert.Contains("<meta property=\"og:url\" content=\"https://localhost/thu-tuc\">", html, StringComparison.Ordinal);
        Assert.Contains("<meta name=\"DC.identifier\" content=\"https://localhost/thu-tuc\">", html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task DaKhaiTenMien_HostLa_BiTuChoi400_VaKhongPhanChieuHost()
    {
        await using var factory = new TrangFactory();

        var (ma, html) = await LayAsync(factory, "/thu-tuc", HostLa);

        Assert.Equal(HttpStatusCode.BadRequest, ma);
        Assert.DoesNotContain(HostLa, html, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("/thu-tuc")]
    [InlineData("/api/trung-tam")]
    [InlineData("/health/live")]
    public async Task HostLa_Response400CoDuHeaderBaoMat_VaLaProblemDetailsCoMa(string duong)
    {
        await using var factory = new TrangFactory();
        using var client = factory.CreateHttpsClient();
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, new Uri(duong, UriKind.Relative));
        yeuCau.Headers.Host = HostLa;

        using var response = await client.SendAsync(yeuCau, TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Contains("default-src 'self'", Assert.Single(response.Headers.GetValues("Content-Security-Policy")), StringComparison.Ordinal);
        Assert.Equal("nosniff", Assert.Single(response.Headers.GetValues("X-Content-Type-Options")));
        Assert.Equal("strict-origin-when-cross-origin", Assert.Single(response.Headers.GetValues("Referrer-Policy")));
        Assert.Equal("microphone=(), camera=(), geolocation=()", Assert.Single(response.Headers.GetValues("Permissions-Policy")));
        using var json = System.Text.Json.JsonDocument.Parse(body);
        Assert.Equal("du-lieu-khong-hop-le", json.RootElement.GetProperty("code").GetString());
        Assert.False(string.IsNullOrEmpty(json.RootElement.GetProperty("maTraCuu").GetString()));
        Assert.DoesNotContain(HostLa, body, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("localhost", "localhost", true)]
    [InlineData("localhost", "LOCALHOST:7157", true)]
    [InlineData("localhost", "localhost.evil.example", false)]
    [InlineData("a.example;b.example", "b.example", true)]
    [InlineData("*.example", "www.example", true)]
    [InlineData("*.example", "example", false)]
    [InlineData("*.example", "x.example.evil", false)]
    [InlineData("localhost:7157", "localhost:7157", true)]
    [InlineData("localhost:7157", "localhost:9", false)]
    [InlineData("localhost:7157", "localhost", false)]
    [InlineData("*", "bat-ky.example", true)]
    [InlineData(null, "bat-ky.example", true)]
    public void HopLe_KhopMauAllowedHosts(string? allowedHosts, string host, bool mongDoi) =>
        Assert.Equal(mongDoi, new TenMienCongKhai(allowedHosts).HopLe(new HostString(host)));

    [Fact]
    public void HopLe_HostRongLuonQua() =>
        Assert.True(new TenMienCongKhai("a.example").HopLe(default));

    [Fact]
    public async Task OgUrl_DuongDanVietHoaDuocChuanHoaTheoFileDacTa()
    {
        await using var factory = new TrangFactory();

        var (_, html) = await LayAsync(factory, "/THU-TUC/");

        Assert.Contains("<meta property=\"og:url\" content=\"https://localhost/thu-tuc\">", html, StringComparison.Ordinal);
        Assert.Contains("<meta name=\"DC.identifier\" content=\"https://localhost/thu-tuc\">", html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ProductionChuaKhaiAllowedHosts_KhoiDongGhiCanhBao()
    {
        var log = new System.Collections.Concurrent.ConcurrentQueue<(Microsoft.Extensions.Logging.LogLevel, string)>();
        await using var factory = new CanhBaoFactory(log);
        using var client = factory.CreateHttpsClient();
        using var response = await client.GetAsync("/health/live", TestContext.Current.CancellationToken);

        Assert.Contains(log, l => l.Item1 == Microsoft.Extensions.Logging.LogLevel.Warning
            && l.Item2.Contains("AllowedHosts", StringComparison.Ordinal));
    }

    [Fact]
    public async Task ProductionDaKhaiAllowedHosts_KhongCanhBao()
    {
        var log = new System.Collections.Concurrent.ConcurrentQueue<(Microsoft.Extensions.Logging.LogLevel, string)>();
        await using var factory = new CanhBaoFactory(log) { Khai = true };
        using var client = factory.CreateHttpsClient();
        using var response = await client.GetAsync("/health/live", TestContext.Current.CancellationToken);

        Assert.DoesNotContain(log, l => l.Item2.Contains("Chưa khai AllowedHosts", StringComparison.Ordinal));
    }

    [Fact]
    public async Task CacheDacTaHetHan_NhieuYeuCauDongThoiChiGoiDichVuMotLan()
    {
        await using var factory = new TrangFactory();
        factory.DichVu.Tre = TimeSpan.FromMilliseconds(300);
        using var client = factory.CreateHttpsClient();

        var ketQua = await Task.WhenAll(Enumerable.Range(0, 8).Select(_ => LayAsync(factory, "/")));

        Assert.All(ketQua, k => Assert.Equal(HttpStatusCode.OK, k.Ma));
        Assert.Equal(1, factory.DichVu.DemDacTa);
    }

    [Theory]
    [InlineData(typeof(TrangChuaKhaiTenMienFactory))]
    [InlineData(typeof(TrangKhaiSaoFactory))]
    public async Task ChuaKhaiHoacKhaiSao_HostLa_TrangVanTraNhungKhongCoHostLaVaKhongCoOgUrl(Type loaiFactory)
    {
        await using var factory = (ApiFactory)Activator.CreateInstance(loaiFactory)!;

        var (ma, html) = await LayAsync(factory, "/thu-tuc", HostLa);

        Assert.Equal(HttpStatusCode.OK, ma);
        Assert.Contains("<title>Danh mục thủ tục – Trung tâm thử A</title>", html, StringComparison.Ordinal);
        Assert.DoesNotContain(HostLa, html, StringComparison.Ordinal);
        Assert.DoesNotContain("og:url", html, StringComparison.Ordinal);
        Assert.DoesNotContain("DC.identifier", html, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("/%22%3E%3Cscript%3Ealert(1)%3C/script%3E")]
    [InlineData("/%3Cimg%20src=x%20onerror=alert(1)%3E")]
    [InlineData("/%27%20onload=%27alert(1)")]
    public async Task DuongDanChuaKyTuDacBiet_KhongTaoScriptHayThoatThuocTinh_VaKhongPhanChieu(string duong)
    {
        await using var factory = new TrangFactory();

        var (ma, html) = await LayAsync(factory, duong);

        Assert.Equal(HttpStatusCode.OK, ma);
        Assert.DoesNotContain("<script", html, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("<img", html, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("alert(1)", html, StringComparison.Ordinal);
        Assert.DoesNotContain("og:url", html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task HostChuaKyTuDacBiet_KhongTaoScript()
    {
        await using var factory = new TrangChuaKhaiTenMienFactory();

        // Host có ký tự lạ bị loại ở tầng HTTP (tiêu đề không hợp lệ) hoặc không bị phản chiếu; trường hợp nào cũng không có script.
        string html;
        try
        {
            (_, html) = await LayAsync(factory, "/", "\"><script>alert(1)</script>.example");
        }
        catch (FormatException)
        {
            return;
        }

        Assert.DoesNotContain("<script", html, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Development_ChiChoPhepLocalhost()
    {
        await using var factory = new DevelopmentApiFactory();

        using var client = factory.CreateHttpsClient();
        using var tot = await client.GetAsync("/health/live", TestContext.Current.CancellationToken);
        using var la = new HttpRequestMessage(HttpMethod.Get, "/health/live");
        la.Headers.Host = HostLa;
        using var xau = await client.SendAsync(la, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, tot.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, xau.StatusCode);
    }

    [Theory]
    [InlineData(null, false)]
    [InlineData("", false)]
    [InlineData("*", false)]
    [InlineData("a.example;*", false)]
    [InlineData("a.example", true)]
    [InlineData("a.example; b.example", true)]
    [InlineData("*.example", true)]
    public void HostTinCay_TheoAllowedHosts(string? allowedHosts, bool mongDoi) =>
        Assert.Equal(mongDoi, new TenMienCongKhai(allowedHosts).HostTinCay);

    [Fact]
    public void DiaChiTuyetDoi_KhongTinCay_LaNull()
    {
        var context = new DefaultHttpContext();
        context.Request.Scheme = "https";
        context.Request.Host = new HostString(HostLa);

        Assert.Null(new TenMienCongKhai("*").DiaChiTuyetDoi(context.Request, "/x"));
        Assert.Equal($"https://{HostLa}/x", new TenMienCongKhai(HostLa).DiaChiTuyetDoi(context.Request, "/x"));
    }

    [Fact]
    public async Task NoiDungFileDuocNho_KhiKhongDoiMtimeVaKichThuoc_VaDocLaiKhiDoi()
    {
        await using var factory = new TrangFactory();
        var tep = Path.Combine(factory.WebRoot, "index.html");
        var (_, dau) = await LayAsync(factory, "/");
        Assert.Contains("Mô tả trang chủ.", dau, StringComparison.Ordinal);
        Assert.True(File.Exists(tep));

        // Cùng độ dài và cùng thời gian sửa: bản trong bộ nhớ vẫn được dùng.
        var mtime = File.GetLastWriteTimeUtc(tep);
        var cu = await File.ReadAllTextAsync(tep, TestContext.Current.CancellationToken);
        var moi = cu.Replace("<body></body>", "<BODY></BODY>", StringComparison.Ordinal);
        Assert.Equal(cu.Length, moi.Length);
        await File.WriteAllTextAsync(tep, moi, TestContext.Current.CancellationToken);
        File.SetLastWriteTimeUtc(tep, mtime);
        var (_, giuNguyen) = await LayAsync(factory, "/");
        Assert.Contains("<body></body>", giuNguyen, StringComparison.Ordinal);

        // Đổi thời gian sửa: đọc lại.
        File.SetLastWriteTimeUtc(tep, mtime.AddMinutes(1));
        var (_, daDoi) = await LayAsync(factory, "/");
        Assert.Contains("<BODY></BODY>", daDoi, StringComparison.Ordinal);
    }
}

public sealed class CanhBaoFactory(System.Collections.Concurrent.ConcurrentQueue<(Microsoft.Extensions.Logging.LogLevel, string)> log) : ApiFactory
{
    public bool Khai { get; init; }

    protected override string? AllowedHosts => Khai ? "localhost" : null;

    protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureLogging(logging => logging.AddProvider(new HangDoiLog(log)));
    }
}

/// <summary>dac-ta-trang.json sai hình dạng: trang vẫn trả 200, không 500.</summary>
public class TrangDacTaFactory(string json) : TrangFactory
{
    protected override string? DacTaTrangJson => json;
}

public sealed class TrangDacTaBenTests
{
    private const string MauTieuDe = "\"mauTieuDe\": \"{{trang}} – {{trungTam}}\"";

    private static async Task<(HttpStatusCode Ma, string Html)> LayAsync(string json, string duong)
    {
        await using var factory = new TrangDacTaFactory(json);
        using var client = factory.CreateHttpsClient();
        using var response = await client.GetAsync(new Uri(duong, UriKind.Relative), TestContext.Current.CancellationToken);

        return (response.StatusCode, await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task TrangNull_Tra200VaKhoiMacDinh()
    {
        var (ma, html) = await LayAsync("{ " + MauTieuDe + ", \"trang\": null }", "/");

        Assert.Equal(HttpStatusCode.OK, ma);
        Assert.Contains(TrangFactory.KhoiMacDinh, html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task HaiKhoaChiKhacHoaThuong_KhongNem_LayKhoaDau()
    {
        var json = "{ " + MauTieuDe + ", \"trang\": { \"/thu-tuc\": { \"ten\": \"Khoá đầu\", \"moTa\": \"a\" }, "
            + "\"/THU-TUC\": { \"ten\": \"Khoá sau\", \"moTa\": \"b\" } } }";

        var (ma, html) = await LayAsync(json, "/Thu-Tuc");

        Assert.Equal(HttpStatusCode.OK, ma);
        Assert.Contains("<title>Khoá đầu – Trung tâm thử A</title>", html, StringComparison.Ordinal);
        Assert.DoesNotContain("Khoá sau", html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task GiaTriNull_ThanhChuoiRongVaBoTheMoTa()
    {
        var json = "{ " + MauTieuDe + ", \"trang\": { \"/\": { \"ten\": \"Trang chủ\", \"moTa\": null }, \"/thu-tuc\": null } }";

        var (ma, html) = await LayAsync(json, "/");
        var (maThuTuc, htmlThuTuc) = await LayAsync(json, "/thu-tuc");

        Assert.Equal(HttpStatusCode.OK, ma);
        Assert.Contains("<title>Trang chủ – Trung tâm thử A</title>", html, StringComparison.Ordinal);
        Assert.DoesNotContain("name=\"description\"", html, StringComparison.Ordinal);
        Assert.DoesNotContain("og:description", html, StringComparison.Ordinal);
        Assert.Equal(HttpStatusCode.OK, maThuTuc);
        // Mục null bị bỏ, rơi vào trang "không tìm thấy" (không có trong file này) → khối mặc định.
        Assert.Contains(TrangFactory.KhoiMacDinh, htmlThuTuc, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("{ " + MauTieuDe + ", \"trang\": [] }")]
    [InlineData("{ " + MauTieuDe + ", \"trang\": { \"/\": 5 } }")]
    [InlineData("{ " + MauTieuDe + ", \"khongTimThay\": \"x\" }")]
    [InlineData("null")]
    [InlineData("[]")]
    public async Task HinhDangLa_KhongBao_Gio_500(string json)
    {
        var (ma, html) = await LayAsync(json, "/");

        Assert.Equal(HttpStatusCode.OK, ma);
        Assert.Contains("<html", html, StringComparison.Ordinal);
    }
}

public sealed class NhatKyTests
{
    private static DefaultHttpContext TaoContext(string duongDan, string? mauRoute)
    {
        var context = new DefaultHttpContext();
        context.Request.Path = duongDan;
        if (mauRoute is not null)
        {
            context.SetEndpoint(TaoEndpoint(mauRoute));
        }

        return context;
    }

    private static RouteEndpoint TaoEndpoint(string mauRoute) =>
        new(_ => Task.CompletedTask, RoutePatternFactory.Parse(mauRoute), 0, EndpointMetadataCollection.Empty, "thu");

    [Fact]
    public void MauDuongDan_GhiMauRoute_KhongGhiGiaTriThamSo()
    {
        var context = TaoContext("/api/thu-tuc/0912345678", "api/thu-tuc/{ma:maThuTuc}");

        var mau = NhatKy.MauDuongDan(context, StatusCodes.Status404NotFound);

        Assert.Equal("/api/thu-tuc/{ma}", mau);
        Assert.DoesNotContain("0912345678", mau, StringComparison.Ordinal);
    }

    [Fact]
    public void MauDuongDan_KhongCoEndpoint404_LaRouteKhongTonTai()
    {
        var context = TaoContext("/api/0912345678", mauRoute: null);

        Assert.Equal(NhatKy.RouteKhongTonTai, NhatKy.MauDuongDan(context, StatusCodes.Status404NotFound));
    }

    [Fact]
    public void MauDuongDan_KhongCoEndpointMaKhac404_LaRouteChuaXacDinh()
    {
        var context = TaoContext("/api/0912345678", mauRoute: null);

        Assert.Equal(NhatKy.RouteChuaXacDinh, NhatKy.MauDuongDan(context, StatusCodes.Status413PayloadTooLarge));
    }

    [Fact]
    public void MauDuongDan_EndpointBatMoiDuongDan_CoiNhuKhongKhopRoute()
    {
        var context = TaoContext("/api/0912345678", "{*path:nonfile}");

        Assert.Equal(NhatKy.RouteKhongTonTai, NhatKy.MauDuongDan(context, StatusCodes.Status404NotFound));
    }

    [Fact]
    public void MauDuongDan_ExceptionHandlerDaGoEndpoint_LayEndpointGoc()
    {
        var context = TaoContext("/api/thu-tuc/0912345678", mauRoute: null);
        context.Features.Set<IExceptionHandlerFeature>(new ExceptionHandlerFeature { Endpoint = TaoEndpoint("api/thu-tuc/{ma}") });

        Assert.Equal("/api/thu-tuc/{ma}", NhatKy.MauDuongDan(context, StatusCodes.Status500InternalServerError));
    }
}
