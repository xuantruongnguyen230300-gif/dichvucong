using System.Net;
using DichVuCong.Api.Common.Caching;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DichVuCong.Tests.Api;

public sealed class PhienBanGia : IPhienBanDuLieu
{
    private int _soLanDoc;

    public long GiaTri { get; set; } = 100;

    /// <summary>Số lần pipeline hỏi phiên bản dữ liệu (kiểm "không chạm nguồn dữ liệu").</summary>
    public int SoLanDoc => Volatile.Read(ref _soLanDoc);

    public Task<long> LayAsync(CancellationToken cancellationToken)
    {
        Interlocked.Increment(ref _soLanDoc);
        return Task.FromResult(GiaTri);
    }
}

public sealed class DemLanChay
{
    public int Count;
}

/// <summary>Chỉ có trong test: endpoint gắn policy danh-muc, đếm số lần thật sự chạy.</summary>
[ApiController]
[Route("api/test-cache")]
public sealed class CacheMauController(DemLanChay dem) : ControllerBase
{
    [HttpGet]
    [OutputCache(PolicyName = CachePolicies.DanhMuc)]
    public IActionResult Get() => Ok(new { lan = Interlocked.Increment(ref dem.Count) });

    /// <summary>Endpoint có tham số: khai khoá query cần vary.</summary>
    [HttpGet("loc")]
    [OutputCache(PolicyName = CachePolicies.DanhMuc)]
    [DanhMucQuery("q")]
    public IActionResult Loc([FromQuery] string? q) => Ok(new { lan = Interlocked.Increment(ref dem.Count), q });

    [HttpGet("loi")]
    [OutputCache(PolicyName = CachePolicies.DanhMuc)]
    public IActionResult Loi() => NotFound();
}

public sealed class CacheFactory : ApiFactory
{
    public PhienBanGia PhienBan { get; } = new();

    public DemLanChay Dem { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IPhienBanDuLieu>();
            services.AddSingleton<IPhienBanDuLieu>(PhienBan);
            services.AddSingleton(Dem);
        });
    }
}

public sealed class DanhMucCacheTests(CacheFactory factory) : IClassFixture<CacheFactory>
{
    private const string Duong = "/api/test-cache";

    [Fact]
    public async Task CungPhienBan_EndpointChayMotLan_CoETagVaNoCache()
    {
        // Factory riêng: query bị bỏ qua nên mọi test trong fixture dùng chung một mục cache.
        await using var rieng = new CacheFactory();
        using var client = rieng.CreateHttpsClient();
        var truoc = rieng.Dem.Count;

        using var a = await client.GetAsync(new Uri("/api/test-cache?x=1", UriKind.Relative), TestContext.Current.CancellationToken);
        using var b = await client.GetAsync(new Uri("/api/test-cache?x=1", UriKind.Relative), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, a.StatusCode);
        Assert.Equal(HttpStatusCode.OK, b.StatusCode);
        Assert.Equal(truoc + 1, rieng.Dem.Count);
        Assert.NotNull(b.Headers.ETag);
        Assert.Equal(a.Headers.ETag, b.Headers.ETag);
        Assert.True(b.Headers.CacheControl?.NoCache);
    }

    [Fact]
    public async Task IfNoneMatchDung_Tra304()
    {
        using var client = factory.CreateHttpsClient();
        using var a = await client.GetAsync(new Uri(Duong + "?x=304", UriKind.Relative), TestContext.Current.CancellationToken);
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, new Uri(Duong + "?x=304", UriKind.Relative));
        yeuCau.Headers.IfNoneMatch.Add(a.Headers.ETag!);

        using var b = await client.SendAsync(yeuCau, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotModified, b.StatusCode);
    }

    [Fact]
    public async Task DoiPhienBan_EndpointChayLai_ETagMoi_ETagCuKhongCon304()
    {
        using var client = factory.CreateHttpsClient();
        var uri = new Uri(Duong + "?x=doi", UriKind.Relative);
        using var a = await client.GetAsync(uri, TestContext.Current.CancellationToken);
        var truoc = factory.Dem.Count;
        var etagCu = a.Headers.ETag!;

        factory.PhienBan.GiaTri += 1;
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, uri);
        yeuCau.Headers.IfNoneMatch.Add(etagCu);
        using var b = await client.SendAsync(yeuCau, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, b.StatusCode);
        Assert.Equal(truoc + 1, factory.Dem.Count);
        Assert.NotEqual(etagCu, b.Headers.ETag);
        factory.PhienBan.GiaTri -= 1;
    }

    [Fact]
    public async Task ResponseKhong200_KhongCoETagVaKhongDuocLuu()
    {
        using var client = factory.CreateHttpsClient();

        using var a = await client.GetAsync(new Uri(Duong + "/loi", UriKind.Relative), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, a.StatusCode);
        Assert.Null(a.Headers.ETag);
    }

    [Fact]
    public async Task Post_KhongDuocCache()
    {
        using var client = factory.CreateHttpsClient();
        using var noiDung = new StringContent(string.Empty);

        using var a = await client.PostAsync(new Uri(Duong, UriKind.Relative), noiDung, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.MethodNotAllowed, a.StatusCode);
        Assert.Null(a.Headers.ETag);
    }

    [Fact]
    public async Task EndpointKhongThamSo_QueryLaKhongLamRaMucCacheMoi()
    {
        await using var rieng = new CacheFactory();
        using var client = rieng.CreateHttpsClient();

        using var a = await client.GetAsync(new Uri(Duong + "?x=1", UriKind.Relative), TestContext.Current.CancellationToken);
        using var b = await client.GetAsync(new Uri(Duong + "?x=2", UriKind.Relative), TestContext.Current.CancellationToken);
        using var c = await client.GetAsync(new Uri(Duong, UriKind.Relative), TestContext.Current.CancellationToken);

        Assert.Equal(1, rieng.Dem.Count);
        Assert.Equal(HttpStatusCode.OK, c.StatusCode);
    }

    [Fact]
    public async Task EndpointKhaiThamSo_ChiThamSoDaKhaiTaoMucCacheMoi()
    {
        await using var rieng = new CacheFactory();
        using var client = rieng.CreateHttpsClient();

        using var a = await client.GetAsync(new Uri(Duong + "/loc?q=a&x=1", UriKind.Relative), TestContext.Current.CancellationToken);
        using var b = await client.GetAsync(new Uri(Duong + "/loc?q=a&x=2", UriKind.Relative), TestContext.Current.CancellationToken);
        Assert.Equal(1, rieng.Dem.Count);

        using var c = await client.GetAsync(new Uri(Duong + "/loc?q=b&x=1", UriKind.Relative), TestContext.Current.CancellationToken);
        Assert.Equal(2, rieng.Dem.Count);
        Assert.Equal(HttpStatusCode.OK, c.StatusCode);
    }
}
