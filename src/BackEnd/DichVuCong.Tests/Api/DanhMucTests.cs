using System.Net;
using System.Text.Json;
using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Features.DanhMuc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DichVuCong.Tests.Api;

/// <summary>Thay dịch vụ thật để test HTTP không phụ thuộc dữ liệu.</summary>
public sealed class DichVuDanhMucGia : IDanhMucService
{
    private int _demThuTuc;
    private int _demLinhVuc;

    public IReadOnlyList<ThuTucRutGonDto> ThuTuc { get; set; } =
    [
        new("D.01", "Thủ tục thử một", "thu tuc thu mot", "ho-tich", "toan-trinh", true, false, 1, "5 ngày", "Ủy ban nhân dân cấp xã"),
        new("D.02", "Thủ tục thử hai", "thu tuc thu hai", "dat-dai", "mot-phan", false, true, null, null, null),
    ];

    public IReadOnlyList<LinhVucDto> LinhVuc { get; set; } =
    [
        new("dat-dai", "Đất đai", "dat dai", 0, 1),
        new("ho-tich", "Hộ tịch", "ho tich", 1, 0),
    ];

    public bool NemLoi { get; set; }

    public int DemThuTuc => Volatile.Read(ref _demThuTuc);

    public int DemLinhVuc => Volatile.Read(ref _demLinhVuc);

    public Task<IReadOnlyList<ThuTucRutGonDto>> LayThuTucAsync(CancellationToken cancellationToken)
    {
        Interlocked.Increment(ref _demThuTuc);

        return NemLoi ? throw new InvalidOperationException("Host=bi-mat") : Task.FromResult(ThuTuc);
    }

    public Task<IReadOnlyList<LinhVucDto>> LayLinhVucAsync(CancellationToken cancellationToken)
    {
        Interlocked.Increment(ref _demLinhVuc);

        return NemLoi ? throw new InvalidOperationException("Host=bi-mat") : Task.FromResult(LinhVuc);
    }
}

public class DanhMucFactory : ApiFactory
{
    public DichVuDanhMucGia DichVu { get; } = new();

    public PhienBanGia PhienBan { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IPhienBanDuLieu>();
            services.AddSingleton<IPhienBanDuLieu>(PhienBan);
            services.RemoveAll<IDanhMucService>();
            services.AddSingleton<IDanhMucService>(DichVu);
        });
    }
}

public sealed class DanhMucGioiHanFactory : DanhMucFactory
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.UseSetting("RateLimiting:DanhMuc", "1");
    }
}

public sealed class DanhMucTests(DanhMucFactory factory) : IClassFixture<DanhMucFactory>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static Uri Uri(string duong) => new(duong, UriKind.Relative);

    private static string[] TenTruong(JsonElement phanTu) =>
        [.. phanTu.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal)];

    [Fact]
    public async Task ThuTuc_Tra200_JsonCamelCase_DungTenTruong_NullVanCo()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri("/api/thu-tuc"), Ct);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));
        var ds = json.RootElement;

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(JsonValueKind.Array, ds.ValueKind);
        Assert.Equal(2, ds.GetArrayLength());
        Assert.Equal(
            ["capTinh", "capXa", "coQuanThucHien", "linhVucMa", "ma", "mucDo", "ten", "tenTimKiem", "thoiHan", "thuTuThuongGap"],
            TenTruong(ds[0]));
        Assert.Equal("ho-tich", ds[0].GetProperty("linhVucMa").GetString());
        Assert.Equal("toan-trinh", ds[0].GetProperty("mucDo").GetString());
        Assert.True(ds[0].GetProperty("capXa").GetBoolean());
        Assert.False(ds[0].GetProperty("capTinh").GetBoolean());
        Assert.Equal(1, ds[0].GetProperty("thuTuThuongGap").GetInt32());
        Assert.Equal(JsonValueKind.Null, ds[1].GetProperty("thuTuThuongGap").ValueKind);
        Assert.Equal(JsonValueKind.Null, ds[1].GetProperty("thoiHan").ValueKind);
        Assert.Equal(JsonValueKind.Null, ds[1].GetProperty("coQuanThucHien").ValueKind);
    }

    [Fact]
    public async Task LinhVuc_Tra200_JsonCamelCase_DungTenTruong()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri("/api/linh-vuc"), Ct);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));
        var ds = json.RootElement;

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(["ma", "soThuTucTinh", "soThuTucXa", "ten", "tenTimKiem"], TenTruong(ds[0]));
        Assert.Equal("dat-dai", ds[0].GetProperty("ma").GetString());
        Assert.Equal(1, ds[0].GetProperty("soThuTucTinh").GetInt32());
        Assert.Equal(0, ds[0].GetProperty("soThuTucXa").GetInt32());
    }

    [Theory]
    [InlineData("/api/thu-tuc")]
    [InlineData("/api/linh-vuc")]
    public async Task Tra200_CoETagVaNoCache(string duong)
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri(duong), Ct);

        Assert.NotNull(response.Headers.ETag);
        Assert.True(response.Headers.CacheControl?.NoCache);
    }

    [Theory]
    [InlineData("/api/thu-tuc")]
    [InlineData("/api/linh-vuc")]
    public async Task IfNoneMatchKhop_Tra304_VaDichVuKhongChay(string duong)
    {
        await using var rieng = new DanhMucFactory();
        using var client = rieng.CreateHttpsClient();
        using var dau = await client.GetAsync(Uri(duong), Ct);
        var truoc = rieng.DichVu.DemThuTuc + rieng.DichVu.DemLinhVuc;
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, Uri(duong));
        yeuCau.Headers.IfNoneMatch.Add(dau.Headers.ETag!);

        using var sau = await client.SendAsync(yeuCau, Ct);

        Assert.Equal(HttpStatusCode.NotModified, sau.StatusCode);
        Assert.Equal(truoc, rieng.DichVu.DemThuTuc + rieng.DichVu.DemLinhVuc);
    }

    [Theory]
    [InlineData("/api/thu-tuc")]
    [InlineData("/api/linh-vuc")]
    public async Task DoiPhienBanDuLieu_Tra200DuLieuMoi_KhongPhaiBanCache(string duong)
    {
        await using var rieng = new DanhMucFactory();
        using var client = rieng.CreateHttpsClient();
        using var dau = await client.GetAsync(Uri(duong), Ct);
        var etagCu = dau.Headers.ETag!;

        // Nhập dữ liệu mới: phiên bản đổi, dữ liệu của dịch vụ đổi.
        rieng.PhienBan.GiaTri += 1;
        rieng.DichVu.ThuTuc = [rieng.DichVu.ThuTuc[0] with { Ten = "Tên đã đổi" }];
        rieng.DichVu.LinhVuc = [rieng.DichVu.LinhVuc[0] with { Ten = "Tên đã đổi" }];
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, Uri(duong));
        yeuCau.Headers.IfNoneMatch.Add(etagCu);
        using var sau = await client.SendAsync(yeuCau, Ct);
        using var json = JsonDocument.Parse(await sau.Content.ReadAsStringAsync(Ct));

        Assert.Equal(HttpStatusCode.OK, sau.StatusCode);
        Assert.NotEqual(etagCu, sau.Headers.ETag);
        Assert.Equal(1, json.RootElement.GetArrayLength());
        Assert.Equal("Tên đã đổi", json.RootElement[0].GetProperty("ten").GetString());
    }

    [Theory]
    [InlineData("/api/thu-tuc")]
    [InlineData("/api/linh-vuc")]
    public async Task Head_Tra200_CungHeaderVoiGet(string duong)
    {
        using var client = factory.CreateHttpsClient();
        using var get = await client.GetAsync(Uri(duong), Ct);
        using var yeuCau = new HttpRequestMessage(HttpMethod.Head, Uri(duong));

        using var head = await client.SendAsync(yeuCau, Ct);

        Assert.Equal(HttpStatusCode.OK, head.StatusCode);
        Assert.Equal(get.Headers.ETag, head.Headers.ETag);
        Assert.True(head.Headers.CacheControl?.NoCache);
        // Thân rỗng do Kestrel cắt; TestServer không cắt nên không kiểm ở đây (đã kiểm bằng curl -I).
    }

    [Theory]
    [InlineData("/api/thu-tuc")]
    [InlineData("/api/linh-vuc")]
    public async Task Post_Tra405(string duong)
    {
        using var client = factory.CreateHttpsClient();
        using var noiDung = new StringContent(string.Empty);

        using var response = await client.PostAsync(Uri(duong), noiDung, Ct);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));

        Assert.Equal(HttpStatusCode.MethodNotAllowed, response.StatusCode);
        Assert.Equal("phuong-thuc-khong-hop-le", json.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task QueryLa_KhongThoiCache_DichVuChiChayMotLan()
    {
        await using var rieng = new DanhMucFactory();
        using var client = rieng.CreateHttpsClient();

        for (var i = 0; i < 5; i++)
        {
            using var thuTuc = await client.GetAsync(Uri($"/api/thu-tuc?x={i}&cap=tinh"), Ct);
            using var linhVuc = await client.GetAsync(Uri($"/api/linh-vuc?x={i}"), Ct);
            Assert.Equal(HttpStatusCode.OK, thuTuc.StatusCode);
            Assert.Equal(HttpStatusCode.OK, linhVuc.StatusCode);
        }

        Assert.Equal(1, rieng.DichVu.DemThuTuc);
        Assert.Equal(1, rieng.DichVu.DemLinhVuc);
    }

    [Theory]
    [InlineData("/api/thu-tuc")]
    [InlineData("/api/linh-vuc")]
    public async Task DanhSachRong_Tra200_MangRong(string duong)
    {
        await using var rieng = new DanhMucFactory();
        rieng.DichVu.ThuTuc = [];
        rieng.DichVu.LinhVuc = [];
        using var client = rieng.CreateHttpsClient();

        using var response = await client.GetAsync(Uri(duong), Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("[]", await response.Content.ReadAsStringAsync(Ct));
    }

    [Theory]
    [InlineData("/api/thu-tuc")]
    [InlineData("/api/linh-vuc")]
    public async Task DichVuNemLoi_Tra500_LoiHeThong_CoMaTraCuu_KhongLoChiTiet(string duong)
    {
        await using var rieng = new DanhMucFactory();
        rieng.DichVu.NemLoi = true;
        using var client = rieng.CreateHttpsClient();

        using var response = await client.GetAsync(Uri(duong), Ct);
        var than = await response.Content.ReadAsStringAsync(Ct);
        using var json = JsonDocument.Parse(than);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal("loi-he-thong", json.RootElement.GetProperty("code").GetString());
        Assert.False(string.IsNullOrEmpty(json.RootElement.GetProperty("maTraCuu").GetString()));
        Assert.DoesNotContain("bi-mat", than, StringComparison.Ordinal);
        Assert.DoesNotContain("   at ", than, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("/api/thu-tuc")]
    [InlineData("/api/linh-vuc")]
    public async Task VuotGioiHanDanhMuc_Tra429(string duong)
    {
        await using var gioiHan = new DanhMucGioiHanFactory();
        using var client = gioiHan.CreateHttpsClient();

        using var dau = await client.GetAsync(Uri(duong), Ct);
        using var sau = await client.GetAsync(Uri(duong), Ct);
        using var json = JsonDocument.Parse(await sau.Content.ReadAsStringAsync(Ct));

        Assert.Equal(HttpStatusCode.OK, dau.StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, sau.StatusCode);
        Assert.Equal("qua-nhieu-yeu-cau", json.RootElement.GetProperty("code").GetString());
    }
}

/// <summary>Dịch vụ thật trên file dữ liệu mẫu nhúng (nguồn Mẫu, không DB).</summary>
public sealed class DanhMucTrenFileNhungTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static Uri Uri(string duong) => new(duong, UriKind.Relative);

    [Fact]
    public async Task ThuTuc_408Dong_KhongCoThoiHanKhac()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri("/api/thu-tuc"), Ct);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(408, json.RootElement.GetArrayLength());
        Assert.DoesNotContain(
            json.RootElement.EnumerateArray(),
            t => t.GetProperty("thoiHan").GetString() is "Khác" or "1 Khác");
        Assert.NotNull(response.Headers.ETag);
    }

    [Fact]
    public async Task LinhVuc_75Dong()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri("/api/linh-vuc"), Ct);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(75, json.RootElement.GetArrayLength());
    }
}
