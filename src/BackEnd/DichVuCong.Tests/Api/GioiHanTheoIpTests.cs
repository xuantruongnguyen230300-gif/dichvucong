using System.Net;
using DichVuCong.Api.Common.RateLimiting;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Api;

/// <summary>
/// Máy chủ thử không có kết nối thật nên <c>RemoteIpAddress</c> là null: bộ lọc khởi động này đặt nó từ header
/// <c>X-Test-Remote</c> (đứng ngoài cùng, trước ForwardedHeaders) để mô phỏng máy gọi tới API.
/// </summary>
internal sealed class GiaIpMayGoiFilter : IStartupFilter
{
    public const string Header = "X-Test-Remote";

    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next) => app =>
    {
        app.Use((context, tiep) =>
        {
            if (context.Request.Headers.TryGetValue(Header, out var ip))
            {
                context.Connection.RemoteIpAddress = IPAddress.Parse(ip.ToString());
            }

            return tiep(context);
        });
        next(app);
    };
}

/// <summary>API với giới hạn danh mục 1 yêu cầu/phút/IP, IP máy gọi giả lập, cấu hình proxy khai tuỳ test.</summary>
public sealed class ProxyFactory(IReadOnlyDictionary<string, string>? cauHinh = null, string? allowedHosts = null) : TrangFactory
{
    protected override string? AllowedHosts => allowedHosts;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.UseSetting("RateLimiting:DanhMuc", "1");
        foreach (var (khoa, giaTri) in cauHinh ?? new Dictionary<string, string>())
        {
            builder.UseSetting(khoa, giaTri);
        }

        builder.ConfigureServices(services => services.AddSingleton<IStartupFilter, GiaIpMayGoiFilter>());
    }
}

public sealed class GioiHanTheoIpTests
{
    private const string ProxyTinCay = "10.0.0.1";

    private static readonly Dictionary<string, string> KhaiProxy = new() { ["Hosting:ForwardedHeaders:KnownProxies:0"] = ProxyTinCay };

    private static async Task<HttpStatusCode> GoiAsync(HttpClient client, string mayGoi, string? xForwardedFor = null)
    {
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, "/health/live");
        yeuCau.Headers.Add(GiaIpMayGoiFilter.Header, mayGoi);
        if (xForwardedFor is not null)
        {
            yeuCau.Headers.Add("X-Forwarded-For", xForwardedFor);
        }

        using var response = await client.SendAsync(yeuCau, TestContext.Current.CancellationToken);

        return response.StatusCode;
    }

    [Theory]
    [InlineData(null, "unknown")]
    [InlineData("203.0.113.5", "203.0.113.5")]
    [InlineData("::ffff:203.0.113.5", "203.0.113.5")]
    [InlineData("2001:db8:1:2:aaaa:bbbb:cccc:dddd", "2001:db8:1:2::/64")]
    [InlineData("2001:db8:1:2::1", "2001:db8:1:2::/64")]
    [InlineData("2001:db8:1:3::1", "2001:db8:1:3::/64")]
    [InlineData("fe80::1%5", "fe80::/64")]
    [InlineData("::1", "::/64")]
    public void KhoaGioiHan_GopIPv6Theo64_IPv4MappedLaIPv4(string? ip, string mongDoi) =>
        Assert.Equal(mongDoi, KhoaGioiHan.TuIp(ip is null ? null : IPAddress.Parse(ip)));

    [Fact]
    public async Task IPv6CungMot64_ChungBoDem_DoiDiaChiKhongLachDuocGioiHan()
    {
        await using var factory = new ProxyFactory();
        using var client = factory.CreateHttpsClient();

        Assert.Equal(HttpStatusCode.OK, await GoiAsync(client, "2001:db8:1:2::1"));
        Assert.Equal(HttpStatusCode.TooManyRequests, await GoiAsync(client, "2001:db8:1:2:ffff::9"));
    }

    [Fact]
    public async Task IPv6Khac64_BoDemRieng()
    {
        await using var factory = new ProxyFactory();
        using var client = factory.CreateHttpsClient();

        Assert.Equal(HttpStatusCode.OK, await GoiAsync(client, "2001:db8:1:2::1"));
        Assert.Equal(HttpStatusCode.OK, await GoiAsync(client, "2001:db8:1:3::1"));
    }

    [Fact]
    public async Task IPv4MappedVaIPv4_ChungBoDem()
    {
        await using var factory = new ProxyFactory();
        using var client = factory.CreateHttpsClient();

        Assert.Equal(HttpStatusCode.OK, await GoiAsync(client, "203.0.113.5"));
        Assert.Equal(HttpStatusCode.TooManyRequests, await GoiAsync(client, "::ffff:203.0.113.5"));
        Assert.Equal(HttpStatusCode.OK, await GoiAsync(client, "203.0.113.6"));
    }

    [Fact]
    public async Task MacDinhTat_XForwardedForBiBoQua_MoiNguonChungBoDemTheoIpKetNoi()
    {
        await using var factory = new ProxyFactory();
        using var client = factory.CreateHttpsClient();

        Assert.Equal(HttpStatusCode.OK, await GoiAsync(client, ProxyTinCay, "203.0.113.5"));
        Assert.Equal(HttpStatusCode.TooManyRequests, await GoiAsync(client, ProxyTinCay, "203.0.113.6"));
    }

    [Fact]
    public async Task DaKhaiProxy_NguonLaGiaXForwardedFor_BiBoQua()
    {
        await using var factory = new ProxyFactory(KhaiProxy);
        using var client = factory.CreateHttpsClient();

        Assert.Equal(HttpStatusCode.OK, await GoiAsync(client, "198.51.100.9", "203.0.113.5"));
        Assert.Equal(HttpStatusCode.TooManyRequests, await GoiAsync(client, "198.51.100.9", "203.0.113.6"));
    }

    [Fact]
    public async Task DaKhaiProxy_NguonTinCay_IpGocDuocDungChoGioiHan()
    {
        await using var factory = new ProxyFactory(KhaiProxy);
        using var client = factory.CreateHttpsClient();

        Assert.Equal(HttpStatusCode.OK, await GoiAsync(client, ProxyTinCay, "203.0.113.5"));
        Assert.Equal(HttpStatusCode.OK, await GoiAsync(client, ProxyTinCay, "203.0.113.6"));
        Assert.Equal(HttpStatusCode.TooManyRequests, await GoiAsync(client, ProxyTinCay, "203.0.113.5"));
    }

    [Fact]
    public async Task DaKhaiMangProxy_NguonTrongMang_DuocTin()
    {
        await using var factory = new ProxyFactory(new Dictionary<string, string> { ["Hosting:ForwardedHeaders:KnownNetworks:0"] = "10.0.0.0/24" });
        using var client = factory.CreateHttpsClient();

        Assert.Equal(HttpStatusCode.OK, await GoiAsync(client, "10.0.0.77", "203.0.113.5"));
        Assert.Equal(HttpStatusCode.OK, await GoiAsync(client, "10.0.0.77", "203.0.113.6"));
        Assert.Equal(HttpStatusCode.TooManyRequests, await GoiAsync(client, "10.0.0.77", "203.0.113.6"));
        // Ngoài mạng: bỏ qua header.
        Assert.Equal(HttpStatusCode.OK, await GoiAsync(client, "10.0.1.77", "203.0.113.7"));
        Assert.Equal(HttpStatusCode.TooManyRequests, await GoiAsync(client, "10.0.1.77", "203.0.113.8"));
    }

    [Fact]
    public async Task DaKhaiProxy_IpGocIPv6_GopTheo64()
    {
        await using var factory = new ProxyFactory(KhaiProxy);
        using var client = factory.CreateHttpsClient();

        Assert.Equal(HttpStatusCode.OK, await GoiAsync(client, ProxyTinCay, "2001:db8:1:2::1"));
        Assert.Equal(HttpStatusCode.TooManyRequests, await GoiAsync(client, ProxyTinCay, "2001:db8:1:2::2"));
    }

    private static async Task<(HttpResponseMessage Response, string Html)> LayTrangQuaProxyAsync(ProxyFactory factory, string mayGoi)
    {
        using var client = factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("http://backend.noi-bo"),
        });
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, "/thu-tuc");
        yeuCau.Headers.Add(GiaIpMayGoiFilter.Header, mayGoi);
        yeuCau.Headers.Add("X-Forwarded-Proto", "https");
        yeuCau.Headers.Add("X-Forwarded-Host", "dichvu.example");

        var response = await client.SendAsync(yeuCau, TestContext.Current.CancellationToken);

        return (response, await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task DaKhaiProxy_NguonTinCay_SchemeVaHostGocChoHstsVaOgUrl()
    {
        await using var factory = new ProxyFactory(KhaiProxy, allowedHosts: "dichvu.example");

        var (response, html) = await LayTrangQuaProxyAsync(factory, ProxyTinCay);
        using var _ = response;

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.Contains("Strict-Transport-Security"));
        Assert.Contains("<meta property=\"og:url\" content=\"https://dichvu.example/thu-tuc\">", html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task DaKhaiProxy_NguonLa_XForwardedProtoVaHostBiBoQua()
    {
        await using var factory = new ProxyFactory(KhaiProxy, allowedHosts: "dichvu.example");

        var (response, _) = await LayTrangQuaProxyAsync(factory, "198.51.100.9");
        using var _1 = response;

        // Host thật là backend.noi-bo, không nằm trong AllowedHosts: header X-Forwarded-Host không cứu được.
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.False(response.Headers.Contains("Strict-Transport-Security"));
    }

    [Fact]
    public async Task MacDinhTat_XForwardedHostBiBoQua()
    {
        await using var factory = new ProxyFactory(allowedHosts: "dichvu.example");

        var (response, _) = await LayTrangQuaProxyAsync(factory, ProxyTinCay);
        using var _1 = response;

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData("Hosting:ForwardedHeaders:KnownProxies:0", "khong-phai-ip", "KnownProxies")]
    [InlineData("Hosting:ForwardedHeaders:KnownNetworks:0", "10.0.0.0", "KnownNetworks")]
    [InlineData("Hosting:ForwardedHeaders:ForwardLimit", "0", "ForwardLimit")]
    public void CauHinhProxySai_DungKhoiDongVaNeuTenMuc(string khoa, string giaTri, string tenMuc)
    {
        using var factory = new ProxyFactory(new Dictionary<string, string> { [khoa] = giaTri });

        var loi = Assert.Throws<InvalidOperationException>(() => factory.CreateClient());

        Assert.Contains(tenMuc, loi.Message, StringComparison.Ordinal);
    }
}
