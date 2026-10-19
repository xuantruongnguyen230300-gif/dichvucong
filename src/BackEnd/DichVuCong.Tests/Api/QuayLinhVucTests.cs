using System.Net;
using System.Text.Json;
using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Features.DanhMuc;
using DichVuCong.Api.Features.QuayLinhVuc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DichVuCong.Tests.Api;

/// <summary>Thay dịch vụ thật để test HTTP không phụ thuộc dữ liệu.</summary>
public sealed class DichVuQuayLinhVucGia : IQuayLinhVucService
{
    private int _dem;

    public IReadOnlyList<QuayLinhVucDto> Quay { get; set; } =
    [
        new("ho-tich", 3),
        new("thuy-loi", 12),
    ];

    public bool NemLoi { get; set; }

    public int Dem => Volatile.Read(ref _dem);

    public Task<IReadOnlyList<QuayLinhVucDto>> LayAsync(CancellationToken cancellationToken)
    {
        Interlocked.Increment(ref _dem);

        return NemLoi ? throw new InvalidOperationException("Host=bi-mat") : Task.FromResult(Quay);
    }
}

public class QuayLinhVucFactory : ApiFactory
{
    public DichVuQuayLinhVucGia DichVu { get; } = new();

    public DichVuDanhMucGia DanhMuc { get; } = new();

    public PhienBanGia PhienBan { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IPhienBanDuLieu>();
            services.AddSingleton<IPhienBanDuLieu>(PhienBan);
            services.RemoveAll<IQuayLinhVucService>();
            services.AddSingleton<IQuayLinhVucService>(DichVu);
            services.RemoveAll<IDanhMucService>();
            services.AddSingleton<IDanhMucService>(DanhMuc);
        });
    }
}

public sealed class QuayLinhVucGioiHanFactory : QuayLinhVucFactory
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.UseSetting("RateLimiting:DanhMuc", "1");
    }
}

public sealed class QuayLinhVucTests(QuayLinhVucFactory factory) : IClassFixture<QuayLinhVucFactory>
{
    private const string Duong = "/api/linh-vuc/quay";

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static Uri Uri(string duong) => new(duong, UriKind.Relative);

    [Fact]
    public async Task Tra200_JsonCamelCase_ChiHaiTruong()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri(Duong), Ct);
        var than = await response.Content.ReadAsStringAsync(Ct);
        using var json = JsonDocument.Parse(than);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("""[{"linhVucMa":"ho-tich","quay":3},{"linhVucMa":"thuy-loi","quay":12}]""", than);
        Assert.Equal(
            ["linhVucMa", "quay"],
            [.. json.RootElement[0].EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal)]);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Tra200_CoETagVaNoCache()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri(Duong), Ct);

        Assert.NotNull(response.Headers.ETag);
        Assert.True(response.Headers.CacheControl?.NoCache);
    }

    [Fact]
    public async Task IfNoneMatchKhop_Tra304_VaDichVuKhongChay()
    {
        await using var rieng = new QuayLinhVucFactory();
        using var client = rieng.CreateHttpsClient();
        using var dau = await client.GetAsync(Uri(Duong), Ct);
        var truoc = rieng.DichVu.Dem;
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, Uri(Duong));
        yeuCau.Headers.IfNoneMatch.Add(dau.Headers.ETag!);

        using var sau = await client.SendAsync(yeuCau, Ct);

        Assert.Equal(HttpStatusCode.NotModified, sau.StatusCode);
        Assert.Equal(truoc, rieng.DichVu.Dem);
    }

    [Fact]
    public async Task DoiPhienBanDuLieu_Tra200DuLieuMoi_KhongPhaiBanCache()
    {
        await using var rieng = new QuayLinhVucFactory();
        using var client = rieng.CreateHttpsClient();
        using var dau = await client.GetAsync(Uri(Duong), Ct);
        var etagCu = dau.Headers.ETag!;

        // Nhập file phân công mới: phiên bản đổi, dữ liệu đổi.
        rieng.PhienBan.GiaTri += 1;
        rieng.DichVu.Quay = [new("ho-tich", 4)];
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, Uri(Duong));
        yeuCau.Headers.IfNoneMatch.Add(etagCu);
        using var sau = await client.SendAsync(yeuCau, Ct);
        var than = await sau.Content.ReadAsStringAsync(Ct);

        Assert.Equal(HttpStatusCode.OK, sau.StatusCode);
        Assert.NotEqual(etagCu, sau.Headers.ETag);
        Assert.Equal("""[{"linhVucMa":"ho-tich","quay":4}]""", than);
    }

    [Fact]
    public async Task Head_Tra200_CungHeaderVoiGet()
    {
        using var client = factory.CreateHttpsClient();
        using var get = await client.GetAsync(Uri(Duong), Ct);
        using var yeuCau = new HttpRequestMessage(HttpMethod.Head, Uri(Duong));

        using var head = await client.SendAsync(yeuCau, Ct);

        Assert.Equal(HttpStatusCode.OK, head.StatusCode);
        Assert.Equal(get.Headers.ETag, head.Headers.ETag);
        Assert.True(head.Headers.CacheControl?.NoCache);
    }

    [Fact]
    public async Task Post_Tra405()
    {
        using var client = factory.CreateHttpsClient();
        using var noiDung = new StringContent(string.Empty);

        using var response = await client.PostAsync(Uri(Duong), noiDung, Ct);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));

        Assert.Equal(HttpStatusCode.MethodNotAllowed, response.StatusCode);
        Assert.Equal("phuong-thuc-khong-hop-le", json.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task QueryLa_KhongThoiCache_DichVuChiChayMotLan()
    {
        await using var rieng = new QuayLinhVucFactory();
        using var client = rieng.CreateHttpsClient();

        for (var i = 0; i < 5; i++)
        {
            using var response = await client.GetAsync(Uri($"{Duong}?x={i}&cap=tinh"), Ct);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        Assert.Equal(1, rieng.DichVu.Dem);
    }

    [Fact]
    public async Task DanhSachRong_Tra200_MangRong()
    {
        await using var rieng = new QuayLinhVucFactory();
        rieng.DichVu.Quay = [];
        using var client = rieng.CreateHttpsClient();

        using var response = await client.GetAsync(Uri(Duong), Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("[]", await response.Content.ReadAsStringAsync(Ct));
    }

    [Fact]
    public async Task DichVuNemLoi_Tra500_LoiHeThong_CoMaTraCuu_KhongLoChiTiet()
    {
        await using var rieng = new QuayLinhVucFactory();
        rieng.DichVu.NemLoi = true;
        using var client = rieng.CreateHttpsClient();

        using var response = await client.GetAsync(Uri(Duong), Ct);
        var than = await response.Content.ReadAsStringAsync(Ct);
        using var json = JsonDocument.Parse(than);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal("loi-he-thong", json.RootElement.GetProperty("code").GetString());
        Assert.False(string.IsNullOrEmpty(json.RootElement.GetProperty("maTraCuu").GetString()));
        Assert.DoesNotContain("bi-mat", than, StringComparison.Ordinal);
        Assert.DoesNotContain("   at ", than, StringComparison.Ordinal);
    }

    [Fact]
    public async Task VuotGioiHanDanhMuc_Tra429()
    {
        await using var gioiHan = new QuayLinhVucGioiHanFactory();
        using var client = gioiHan.CreateHttpsClient();

        using var dau = await client.GetAsync(Uri(Duong), Ct);
        using var sau = await client.GetAsync(Uri(Duong), Ct);
        using var json = JsonDocument.Parse(await sau.Content.ReadAsStringAsync(Ct));

        Assert.Equal(HttpStatusCode.OK, dau.StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, sau.StatusCode);
        Assert.Equal("qua-nhieu-yeu-cau", json.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task HaiRoute_CungChay_LinhVucVanTraDanhSachLinhVuc()
    {
        using var client = factory.CreateHttpsClient();

        using var linhVuc = await client.GetAsync(Uri("/api/linh-vuc"), Ct);
        using var quay = await client.GetAsync(Uri(Duong), Ct);
        using var jsonLinhVuc = JsonDocument.Parse(await linhVuc.Content.ReadAsStringAsync(Ct));
        using var jsonQuay = JsonDocument.Parse(await quay.Content.ReadAsStringAsync(Ct));

        Assert.Equal(HttpStatusCode.OK, linhVuc.StatusCode);
        Assert.Equal(HttpStatusCode.OK, quay.StatusCode);
        Assert.Equal("dat-dai", jsonLinhVuc.RootElement[0].GetProperty("ma").GetString());
        Assert.True(jsonLinhVuc.RootElement[0].TryGetProperty("tenTimKiem", out _));
        Assert.Equal("ho-tich", jsonQuay.RootElement[0].GetProperty("linhVucMa").GetString());
        Assert.False(jsonQuay.RootElement[0].TryGetProperty("ma", out _));
    }
}

/// <summary>Dịch vụ thật trên file dữ liệu mẫu nhúng (nguồn Mẫu, không DB): chưa có phân công nên không ô nào có quầy (AC-6).</summary>
public sealed class QuayLinhVucTrenFileNhungTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task NguonMau_ChuaCoPhanCong_Tra200MangRong()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(new Uri("/api/linh-vuc/quay", UriKind.Relative), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("[]", await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        Assert.NotNull(response.Headers.ETag);
    }
}
