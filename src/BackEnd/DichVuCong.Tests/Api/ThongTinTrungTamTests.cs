using System.Globalization;
using System.Net;
using System.Text.Json;
using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Features.ThongTinTrungTam;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DichVuCong.Tests.Api;

/// <summary>Thay dịch vụ thật để test không cần DB.</summary>
public sealed class DichVuTrungTamGia : IThongTinTrungTamService
{
    private int _demDacTa;
    private int _demLay;

    public ThongTinTrungTamDto? Dto { get; set; } = MauDto();

    public DacTaTrungTam? DacTa { get; set; } = new("Trung tâm thử A", null, new DateOnly(2026, 10, 8));

    public bool NemLoi { get; set; }

    public int DemDacTa => Volatile.Read(ref _demDacTa);

    public int DemLay => Volatile.Read(ref _demLay);

    public Task<ThongTinTrungTamDto?> LayAsync(CancellationToken cancellationToken)
    {
        Interlocked.Increment(ref _demLay);
        return Task.FromResult(Dto);
    }

    /// <summary>Độ trễ giả của lần gọi DB (để thử các yêu cầu đồng thời).</summary>
    public TimeSpan Tre { get; set; }

    public async Task<DacTaTrungTam?> LayDacTaAsync(CancellationToken cancellationToken)
    {
        Interlocked.Increment(ref _demDacTa);
        if (Tre > TimeSpan.Zero)
        {
            await Task.Delay(Tre, cancellationToken);
        }

        return NemLoi ? throw new InvalidOperationException("Host=bi-mat") : DacTa;
    }

    public static ThongTinTrungTamDto MauDto() => new(
        "Trung tâm thử A", "phường thử B", "tỉnh thử C", null, "Người thử", "Giám đốc (dữ liệu thử)",
        "Địa chỉ thử", "0000.000.000", "thu@example.gov.vn", null,
        new MangXaHoiDto(null, null, null, null),
        [new LienKetDto("Cổng Dịch vụ công Quốc gia", "https://dichvucong.gov.vn")],
        [new ODichVuDto("Đánh giá hài lòng", "danh-gia", null)],
        [new GioLamViecDto(1, "07:00", "11:30", "13:30", "17:00")],
        null,
        new DateOnly(2026, 10, 8));
}

public class TrungTamFactory : ApiFactory
{
    public DichVuTrungTamGia DichVu { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IPhienBanDuLieu>();
            services.AddSingleton<IPhienBanDuLieu>(new PhienBanGia());
            services.RemoveAll<IThongTinTrungTamService>();
            services.AddSingleton<IThongTinTrungTamService>(DichVu);
        });
    }
}

public sealed class TrungTamGioiHanFactory : TrungTamFactory
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.UseSetting("RateLimiting:DanhMuc", "1");
    }
}

public sealed class ThongTinTrungTamTests(TrungTamFactory factory) : IClassFixture<TrungTamFactory>
{
    private const string Duong = "/api/trung-tam";

    private static Uri Uri(string duong) => new(duong, UriKind.Relative);

    [Fact]
    public async Task Tra200_JsonCamelCase_DienThoaiOGoc_TruongNullVanCo()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri(Duong), TestContext.Current.CancellationToken);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        var goc = json.RootElement;

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("0000.000.000", goc.GetProperty("dienThoai").GetString());
        Assert.Equal("Trung tâm thử A", goc.GetProperty("ten").GetString());
        Assert.Equal(JsonValueKind.Null, goc.GetProperty("coQuanChuQuan").ValueKind);
        Assert.Equal(JsonValueKind.Null, goc.GetProperty("banDo").ValueKind);
        Assert.Equal(JsonValueKind.Null, goc.GetProperty("mangXaHoi").GetProperty("zaloOa").ValueKind);
        Assert.Equal(JsonValueKind.Null, goc.GetProperty("mangXaHoi").GetProperty("youTube").ValueKind);
        Assert.Equal("danh-gia", goc.GetProperty("oDichVu")[0].GetProperty("bieuTuong").GetString());
        Assert.Equal(JsonValueKind.Null, goc.GetProperty("oDichVu")[0].GetProperty("url").ValueKind);
        Assert.Equal(["bieuTuong", "ten", "url"], [.. goc.GetProperty("oDichVu")[0].EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal)]);
        Assert.Equal("https://dichvucong.gov.vn", goc.GetProperty("lienKet")[0].GetProperty("url").GetString());
        Assert.Equal("07:00", goc.GetProperty("gioLamViec")[0].GetProperty("sangTu").GetString());
        Assert.Equal(1, goc.GetProperty("gioLamViec")[0].GetProperty("thu").GetInt32());
        Assert.Equal("2026-10-08", goc.GetProperty("ngayCapNhatThuTuc").GetString());
        Assert.Equal(
            [
                "banDo", "chucVuNguoiChiuTrachNhiem", "coQuanChuQuan", "diaChi", "dienThoai", "email", "ghiChuNgayNghi",
                "gioLamViec", "lienKet", "mangXaHoi", "ngayCapNhatThuTuc", "nguoiChiuTrachNhiem", "oDichVu", "ten", "tinh", "xa",
            ],
            [.. goc.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal)]);
    }

    [Fact]
    public async Task ChuaCoDuLieu_Tra404_KhongTimThay_CoMaTraCuu()
    {
        await using var rieng = new TrungTamFactory();
        rieng.DichVu.Dto = null;
        using var client = rieng.CreateHttpsClient();

        using var response = await client.GetAsync(Uri(Duong), TestContext.Current.CancellationToken);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("khong-tim-thay", json.RootElement.GetProperty("code").GetString());
        Assert.False(string.IsNullOrEmpty(json.RootElement.GetProperty("maTraCuu").GetString()));
        Assert.Null(response.Headers.ETag);
    }

    [Fact]
    public async Task Post_Tra405()
    {
        using var client = factory.CreateHttpsClient();
        using var noiDung = new StringContent(string.Empty);

        using var response = await client.PostAsync(Uri(Duong), noiDung, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.MethodNotAllowed, response.StatusCode);
    }

    [Fact]
    public async Task Tra200_CoETagVaNoCache()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri(Duong), TestContext.Current.CancellationToken);

        Assert.NotNull(response.Headers.ETag);
        Assert.True(response.Headers.CacheControl?.NoCache);
    }

    [Fact]
    public async Task IfNoneMatchKhop_Tra304()
    {
        using var client = factory.CreateHttpsClient();
        using var dau = await client.GetAsync(Uri(Duong), TestContext.Current.CancellationToken);
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, Uri(Duong));
        yeuCau.Headers.IfNoneMatch.Add(dau.Headers.ETag!);

        using var sau = await client.SendAsync(yeuCau, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotModified, sau.StatusCode);
    }

    [Fact]
    public async Task Head_Tra200_CungHeaderVoiGet()
    {
        using var client = factory.CreateHttpsClient();
        using var get = await client.GetAsync(Uri(Duong), TestContext.Current.CancellationToken);
        using var yeuCau = new HttpRequestMessage(HttpMethod.Head, Uri(Duong));

        using var head = await client.SendAsync(yeuCau, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, head.StatusCode);
        Assert.Equal(get.Headers.ETag, head.Headers.ETag);
        Assert.True(head.Headers.CacheControl?.NoCache);
        Assert.Equal(get.Content.Headers.ContentType, head.Content.Headers.ContentType);
        // Thân rỗng do Kestrel cắt; TestServer không cắt nên không kiểm ở đây (đã kiểm bằng curl -I).
    }

    [Fact]
    public async Task Head_IfNoneMatchKhop_Tra304()
    {
        using var client = factory.CreateHttpsClient();
        using var dau = await client.GetAsync(Uri(Duong), TestContext.Current.CancellationToken);
        using var yeuCau = new HttpRequestMessage(HttpMethod.Head, Uri(Duong));
        yeuCau.Headers.IfNoneMatch.Add(dau.Headers.ETag!);

        using var sau = await client.SendAsync(yeuCau, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotModified, sau.StatusCode);
        Assert.Equal(dau.Headers.ETag, sau.Headers.ETag);
    }

    [Fact]
    public async Task QueryLa_KhongThoiCache_DichVuChiChayMotLan()
    {
        await using var rieng = new TrungTamFactory();
        using var client = rieng.CreateHttpsClient();

        for (var i = 0; i < 5; i++)
        {
            using var response = await client.GetAsync(Uri($"{Duong}?x={i}"), TestContext.Current.CancellationToken);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        Assert.Equal(1, rieng.DichVu.DemLay);
    }

    [Fact]
    public async Task VuotGioiHanDanhMuc_Tra429()
    {
        await using var gioiHan = new TrungTamGioiHanFactory();
        using var client = gioiHan.CreateHttpsClient();

        using var dau = await client.GetAsync(Uri(Duong), TestContext.Current.CancellationToken);
        using var sau = await client.GetAsync(Uri(Duong), TestContext.Current.CancellationToken);
        using var json = JsonDocument.Parse(await sau.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));

        Assert.Equal(HttpStatusCode.OK, dau.StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, sau.StatusCode);
        Assert.Equal("qua-nhieu-yeu-cau", json.RootElement.GetProperty("code").GetString());
    }

    [Theory]
    [InlineData("2026-10-07T17:00:00+00:00", "2026-10-08")]
    [InlineData("2026-10-07T16:59:59+00:00", "2026-10-07")]
    [InlineData("2026-10-08T00:30:00+07:00", "2026-10-08")]
    public void NgayVietNam_DoiSangUtcCong7(string thoiDiem, string mongDoi) =>
        Assert.Equal(
            mongDoi,
            ThongTinTrungTamService.NgayVietNam(DateTimeOffset.Parse(thoiDiem, CultureInfo.InvariantCulture))
                .ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));

    [Fact]
    public void DinhDangGio_HHmm_VaNullGiuNull()
    {
        Assert.Equal("07:00", ThongTinTrungTamService.DinhDangGio(new TimeOnly(7, 0)));
        Assert.Equal("13:05", ThongTinTrungTamService.DinhDangGio(new TimeOnly(13, 5, 59)));
        Assert.Null(ThongTinTrungTamService.DinhDangGio(null));
    }
}
