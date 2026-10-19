using System.Collections.Concurrent;
using System.Net;
using System.Text.Json;
using DichVuCong.Api.Common.Errors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace DichVuCong.Tests.Api;

public sealed class MaTraCuuTests : IClassFixture<ApiFactory>
{
    private static readonly char[] KyTuCam = ['0', 'O', '1', 'I', 'L'];

    private readonly ApiFactory _factory;

    public MaTraCuuTests(ApiFactory factory) => _factory = factory;

    private static async Task<JsonElement> DocAsync(HttpResponseMessage response)
    {
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        return json.RootElement.Clone();
    }

    private static void KiemDinhDang(string? ma)
    {
        Assert.NotNull(ma);
        Assert.Equal(8, ma.Length);
        Assert.All(ma, c => Assert.True(c is (>= 'A' and <= 'Z') or (>= '0' and <= '9'), $"ký tự lạ {c}"));
        Assert.Equal(-1, ma.IndexOfAny(KyTuCam));
    }

    [Fact]
    public void Tao_ra_ma_dung_dinh_dang_va_khac_nhau()
    {
        var cacMa = Enumerable.Range(0, 2000).Select(_ => MaTraCuu.Tao()).ToList();

        Assert.All(cacMa, KiemDinhDang);
        Assert.True(cacMa.Distinct().Count() > 1990);
    }

    [Fact]
    public void Bang_ky_tu_la_31_ky_tu_khong_chua_ky_tu_de_nham()
    {
        Assert.Equal(31, MaTraCuu.BangKyTu.Length);
        Assert.Equal(-1, MaTraCuu.BangKyTu.IndexOfAny(KyTuCam));
    }

    [Fact]
    public async Task Loi_500_co_ma_tra_cuu_khac_nhau_moi_lan_va_khong_con_trace_id()
    {
        using var client = _factory.CreateHttpsClient();

        using var a = await client.GetAsync("/api/test-loi", TestContext.Current.CancellationToken);
        using var b = await client.GetAsync("/api/test-loi", TestContext.Current.CancellationToken);
        var ja = await DocAsync(a);
        var jb = await DocAsync(b);

        KiemDinhDang(ja.GetProperty("maTraCuu").GetString());
        Assert.NotEqual(ja.GetProperty("maTraCuu").GetString(), jb.GetProperty("maTraCuu").GetString());
        Assert.False(ja.TryGetProperty("traceId", out _));
    }

    [Theory]
    [InlineData("/api/khong-co", HttpStatusCode.NotFound)]
    [InlineData("/api/test-loi/khong-hop-le", HttpStatusCode.BadRequest)]
    public async Task Loi_4xx_cung_co_ma_tra_cuu(string duongDan, HttpStatusCode status)
    {
        using var client = _factory.CreateHttpsClient();

        using var response = await client.GetAsync(duongDan, TestContext.Current.CancellationToken);
        var json = await DocAsync(response);

        Assert.Equal(status, response.StatusCode);
        KiemDinhDang(json.GetProperty("maTraCuu").GetString());
        Assert.False(json.TryGetProperty("traceId", out _));
    }

    [Fact]
    public async Task Loi_429_va_413_co_ma_tra_cuu()
    {
        await using var chat = new GioiHanChatFactory();
        using var client = chat.CreateHttpsClient();
        using var dau = await client.GetAsync("/health/live", TestContext.Current.CancellationToken);
        using var qua = await client.GetAsync("/health/live", TestContext.Current.CancellationToken);
        KiemDinhDang((await DocAsync(qua)).GetProperty("maTraCuu").GetString());

        using var normal = _factory.CreateHttpsClient();
        using var content = new ByteArrayContent(new byte[64 * 1024 + 1]);
        using var lon = await normal.PostAsync("/api/test-loi/kiem-tra", content, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, lon.StatusCode);
        KiemDinhDang((await DocAsync(lon)).GetProperty("maTraCuu").GetString());
    }

    [Fact]
    public async Task Ma_tra_cuu_co_trong_log_5xx_muc_error_kem_exception_va_4xx_muc_information_khong_query()
    {
        var logs = new ConcurrentBag<(LogLevel Muc, string Noi, Exception? Loi)>();
        await using var factory = new GhiLogFactory(logs);
        using var client = factory.CreateHttpsClient();

        using var e500 = await client.GetAsync("/api/test-loi", TestContext.Current.CancellationToken);
        using var e404 = await client.GetAsync("/api/khong-co?q=tu-khoa-nguoi-dan", TestContext.Current.CancellationToken);
        var ma500 = (await DocAsync(e500)).GetProperty("maTraCuu").GetString()!;
        var ma404 = (await DocAsync(e404)).GetProperty("maTraCuu").GetString()!;

        var log500 = Assert.Single(logs, x => x.Noi.Contains(ma500, StringComparison.Ordinal));
        Assert.Equal(LogLevel.Error, log500.Muc);
        Assert.NotNull(log500.Loi);

        var log404 = Assert.Single(logs, x => x.Noi.Contains(ma404, StringComparison.Ordinal));
        Assert.Equal(LogLevel.Information, log404.Muc);
        Assert.Contains("404", log404.Noi, StringComparison.Ordinal);
        Assert.Contains("GET", log404.Noi, StringComparison.Ordinal);
        Assert.Contains(NhatKy.RouteKhongTonTai, log404.Noi, StringComparison.Ordinal);
        Assert.DoesNotContain("/api/khong-co", log404.Noi, StringComparison.Ordinal);
        Assert.DoesNotContain("tu-khoa-nguoi-dan", log404.Noi, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("/api/thu-tuc/0912345678", "/api/thu-tuc/{ma}")]
    [InlineData("/api/thu-tuc/0912345678?q=079123456789", "/api/thu-tuc/{ma}")]
    [InlineData("/api/thu-tuc/ho%20ten%20nguyen%20van%20a", NhatKy.RouteKhongTonTai)]
    [InlineData("/api/thu-tuc/a.b.c.d.e.f.g.h.i.j.k.l", NhatKy.RouteKhongTonTai)]
    [InlineData("/0912345678", NhatKy.RouteKhongTonTai)]
    public async Task Log_4xx_chi_ghi_mau_route_khong_ghi_duong_dan_client_gui(string duongDan, string mauMongDoi)
    {
        var logs = new ConcurrentBag<(LogLevel Muc, string Noi, Exception? Loi)>();
        await using var factory = new GhiLogFactory(logs);
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(duongDan, TestContext.Current.CancellationToken);
        var ma = (await DocAsync(response)).GetProperty("maTraCuu").GetString()!;

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var log = Assert.Single(logs, x => x.Noi.Contains(ma, StringComparison.Ordinal));
        Assert.Contains(mauMongDoi, log.Noi, StringComparison.Ordinal);
        Assert.DoesNotContain("0912345678", log.Noi, StringComparison.Ordinal);
        Assert.DoesNotContain("079123456789", log.Noi, StringComparison.Ordinal);
        Assert.DoesNotContain("nguyen", log.Noi, StringComparison.Ordinal);
        Assert.DoesNotContain("a.b.c", log.Noi, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Log_5xx_chi_ghi_mau_route_khong_ghi_duong_dan_client_gui()
    {
        var logs = new ConcurrentBag<(LogLevel Muc, string Noi, Exception? Loi)>();
        await using var factory = new GhiLogFactory(logs);
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync("/api/test-loi?q=0912345678", TestContext.Current.CancellationToken);
        var ma = (await DocAsync(response)).GetProperty("maTraCuu").GetString()!;

        var log = Assert.Single(logs, x => x.Noi.Contains(ma, StringComparison.Ordinal));
        Assert.Contains("/api/test-loi", log.Noi, StringComparison.Ordinal);
        Assert.DoesNotContain("0912345678", log.Noi, StringComparison.Ordinal);
    }

    [Fact]
    public void Gioi_han_tro_ly_la_60_cau_moi_phut()
    {
        var cauHinh = _factory.Services.GetRequiredService<IConfiguration>();

        Assert.Equal(60, cauHinh.GetValue<int>("RateLimiting:TroLy"));
    }

    private sealed class GhiLogFactory(ConcurrentBag<(LogLevel, string, Exception?)> logs) : ApiFactory
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            base.ConfigureWebHost(builder);
            builder.ConfigureLogging(l => l.AddProvider(new BoGhiLog(logs)));
        }
    }

    private sealed class BoGhiLog(ConcurrentBag<(LogLevel, string, Exception?)> logs) : ILoggerProvider
    {
        public ILogger CreateLogger(string categoryName) =>
            categoryName == ProblemDetailsCustomizer.TenLogger || categoryName.EndsWith("GlobalExceptionHandler", StringComparison.Ordinal)
                ? new BoGhi(logs)
                : Microsoft.Extensions.Logging.Abstractions.NullLogger.Instance;

        public void Dispose()
        {
        }
    }

    private sealed class BoGhi(ConcurrentBag<(LogLevel, string, Exception?)> logs) : ILogger
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception,
            Func<TState, Exception?, string> formatter) =>
            logs.Add((logLevel, formatter(state, exception), exception));
    }
}
