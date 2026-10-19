using System.Net;
using System.Text.Json;
using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Features.ChiTietThuTuc;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DichVuCong.Tests.Api;

/// <summary>Thay dịch vụ thật để test HTTP không phụ thuộc dữ liệu.</summary>
public sealed class DichVuChiTietGia : IChiTietThuTucService
{
    public const string MaCo = "T.001";

    public const string MaCoHai = "T.002";

    private int _dem;

    public int DemLay => Volatile.Read(ref _dem);

    public bool NemLoi { get; set; }

    public Task<ChiTietThuTucDto?> LayAsync(string? ma, CancellationToken cancellationToken)
    {
        Interlocked.Increment(ref _dem);
        if (NemLoi)
        {
            throw new InvalidOperationException("Host=bi-mat");
        }

        return Task.FromResult<ChiTietThuTucDto?>(ma switch
        {
            MaCo => Mau(MaCo, "Thủ tục thử một"),
            MaCoHai => Mau(MaCoHai, "Thủ tục thử hai"),
            _ => null,
        });
    }

    private static ChiTietThuTucDto Mau(string ma, string ten) => new(
        ma, ten, "Hộ tịch", "toan-trinh", null, null, "Lệ phí: 0 VNĐ", ["Trực tuyến"], null,
        [new BuocTrinhTuDto(null, "Bước một")],
        [new CachThucNopDto("Trực tuyến", null, null, null)],
        [new GiayToDto("Giấy tờ A", 1, 0), new GiayToDto("Giấy tờ B", null, null)],
        ["Kết quả"],
        [new CanCuDto("85/2019/TT-BTC", null)]);
}

public class ChiTietFactory : ApiFactory
{
    public DichVuChiTietGia DichVu { get; } = new();

    public PhienBanGia PhienBan { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IPhienBanDuLieu>();
            services.AddSingleton<IPhienBanDuLieu>(PhienBan);
            services.RemoveAll<IChiTietThuTucService>();
            services.AddSingleton<IChiTietThuTucService>(DichVu);
        });
    }
}

public sealed class ChiTietGioiHanFactory : ChiTietFactory
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.UseSetting("RateLimiting:DanhMuc", "1");
    }
}

public sealed class ChiTietThuTucTests(ChiTietFactory factory) : IClassFixture<ChiTietFactory>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static Uri Uri(string duong) => new(duong, UriKind.Relative);

    private static string Duong(string ma) => $"/api/thu-tuc/{ma}";

    [Fact]
    public async Task Tra200_JsonCamelCase_TruongNullVanCo_DungTapTruong()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri(Duong(DichVuChiTietGia.MaCo)), Ct);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));
        var goc = json.RootElement;

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType?.ToString());
        Assert.Equal("Thủ tục thử một", goc.GetProperty("ten").GetString());
        Assert.Equal("Hộ tịch", goc.GetProperty("linhVuc").GetString());
        Assert.Equal("toan-trinh", goc.GetProperty("mucDo").GetString());
        Assert.Equal(JsonValueKind.Null, goc.GetProperty("coQuanThucHien").ValueKind);
        Assert.Equal(JsonValueKind.Null, goc.GetProperty("thoiHan").ValueKind);
        Assert.Equal(JsonValueKind.Null, goc.GetProperty("yeuCauDieuKien").ValueKind);
        Assert.Equal("Trực tuyến", goc.GetProperty("hinhThucNop")[0].GetString());
        Assert.Equal(JsonValueKind.Null, goc.GetProperty("trinhTu")[0].GetProperty("truongHop").ValueKind);
        Assert.Equal(1, goc.GetProperty("thanhPhanHoSo")[0].GetProperty("banChinh").GetInt32());
        Assert.Equal(JsonValueKind.Null, goc.GetProperty("thanhPhanHoSo")[1].GetProperty("banSao").ValueKind);
        Assert.Equal(JsonValueKind.Null, goc.GetProperty("canCu")[0].GetProperty("trichYeu").ValueKind);
        Assert.Equal(
            [
                "cachThuc", "canCu", "coQuanThucHien", "hinhThucNop", "ketQua", "linhVuc", "ma", "mucDo", "phi",
                "ten", "thanhPhanHoSo", "thoiHan", "trinhTu", "yeuCauDieuKien",
            ],
            [.. goc.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal)]);
    }

    [Fact]
    public async Task MaLa_Tra404_KhongTimThay_CoMaTraCuu_ThanKhongChuaMa()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri(Duong("9.999999")), Ct);
        var than = await response.Content.ReadAsStringAsync(Ct);
        using var json = JsonDocument.Parse(than);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("khong-tim-thay", json.RootElement.GetProperty("code").GetString());
        Assert.False(string.IsNullOrEmpty(json.RootElement.GetProperty("maTraCuu").GetString()));
        Assert.DoesNotContain("9.999999", than, StringComparison.Ordinal);
        Assert.Null(response.Headers.ETag);
    }

    [Fact]
    public async Task Post_Tra405()
    {
        using var client = factory.CreateHttpsClient();
        using var noiDung = new StringContent(string.Empty);

        using var response = await client.PostAsync(Uri(Duong(DichVuChiTietGia.MaCo)), noiDung, Ct);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));

        Assert.Equal(HttpStatusCode.MethodNotAllowed, response.StatusCode);
        Assert.Equal("phuong-thuc-khong-hop-le", json.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Tra200_CoETagVaNoCache()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri(Duong(DichVuChiTietGia.MaCo)), Ct);

        Assert.NotNull(response.Headers.ETag);
        Assert.True(response.Headers.CacheControl?.NoCache);
    }

    [Fact]
    public async Task IfNoneMatchKhop_Tra304_VaDichVuKhongChay()
    {
        await using var rieng = new ChiTietFactory();
        using var client = rieng.CreateHttpsClient();
        using var dau = await client.GetAsync(Uri(Duong(DichVuChiTietGia.MaCo)), Ct);
        var truoc = rieng.DichVu.DemLay;
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, Uri(Duong(DichVuChiTietGia.MaCo)));
        yeuCau.Headers.IfNoneMatch.Add(dau.Headers.ETag!);

        using var sau = await client.SendAsync(yeuCau, Ct);

        Assert.Equal(HttpStatusCode.NotModified, sau.StatusCode);
        Assert.Equal(truoc, rieng.DichVu.DemLay);
    }

    [Fact]
    public async Task Head_Tra200_CungHeaderVoiGet()
    {
        using var client = factory.CreateHttpsClient();
        using var get = await client.GetAsync(Uri(Duong(DichVuChiTietGia.MaCo)), Ct);
        using var yeuCau = new HttpRequestMessage(HttpMethod.Head, Uri(Duong(DichVuChiTietGia.MaCo)));

        using var head = await client.SendAsync(yeuCau, Ct);

        Assert.Equal(HttpStatusCode.OK, head.StatusCode);
        Assert.Equal(get.Headers.ETag, head.Headers.ETag);
        Assert.True(head.Headers.CacheControl?.NoCache);
        Assert.Equal(get.Content.Headers.ContentType, head.Content.Headers.ContentType);
        // Thân rỗng do Kestrel cắt; TestServer không cắt nên không kiểm ở đây (đã kiểm bằng curl -I).
    }

    [Fact]
    public async Task HaiMaKhacNhau_HaiKetQuaKhacNhau_MoiMaMotMucCache()
    {
        await using var rieng = new ChiTietFactory();
        using var client = rieng.CreateHttpsClient();

        var moi = new[] { DichVuChiTietGia.MaCo, DichVuChiTietGia.MaCoHai };
        var ten = new List<string?>();
        foreach (var ma in moi.Concat(moi))
        {
            using var response = await client.GetAsync(Uri(Duong(ma)), Ct);
            using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));
            ten.Add(json.RootElement.GetProperty("ten").GetString());
        }

        Assert.Equal(["Thủ tục thử một", "Thủ tục thử hai", "Thủ tục thử một", "Thủ tục thử hai"], ten);
        // Lần thứ hai của mỗi mã lấy từ cache: dịch vụ chạy đúng hai lần.
        Assert.Equal(2, rieng.DichVu.DemLay);
    }

    [Fact]
    public async Task QueryLa_KhongThoiCache_DichVuChiChayMotLan()
    {
        await using var rieng = new ChiTietFactory();
        using var client = rieng.CreateHttpsClient();

        for (var i = 0; i < 5; i++)
        {
            using var response = await client.GetAsync(Uri($"{Duong(DichVuChiTietGia.MaCo)}?x={i}"), Ct);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        Assert.Equal(1, rieng.DichVu.DemLay);
    }

    [Theory]
    [InlineData("...")]
    [InlineData("....................")]
    [InlineData("1.001193%20")]
    [InlineData("a%0Ab")]
    [InlineData("abc%3Cb%3Ex%3C%2Fb%3E")]
    [InlineData("123456789012345678901")]
    [InlineData("..%2Fx")]
    public async Task MaSaiDinhDang_Tra404_KhongChamDichVuVaKhongDocPhienBanDuLieu(string ma)
    {
        await using var rieng = new ChiTietFactory();
        using var client = rieng.CreateHttpsClient();
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, Uri(Duong(ma)));
        yeuCau.Headers.IfNoneMatch.Add(new System.Net.Http.Headers.EntityTagHeaderValue("\"1-x\""));

        using var response = await client.SendAsync(yeuCau, Ct);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("khong-tim-thay", json.RootElement.GetProperty("code").GetString());
        Assert.Null(response.Headers.ETag);
        Assert.Equal(0, rieng.DichVu.DemLay);
        Assert.Equal(0, rieng.PhienBan.SoLanDoc);
    }

    [Fact]
    public async Task Tra404_KhongBiCache_DichVuChayMoiLan()
    {
        await using var rieng = new ChiTietFactory();
        using var client = rieng.CreateHttpsClient();

        using var dau = await client.GetAsync(Uri(Duong("9.999999")), Ct);
        using var sau = await client.GetAsync(Uri(Duong("9.999999")), Ct);

        Assert.Equal(HttpStatusCode.NotFound, dau.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, sau.StatusCode);
        Assert.Equal(2, rieng.DichVu.DemLay);
    }

    [Fact]
    public async Task DichVuNemLoi_Tra500_LoiHeThong_KhongLoChiTiet()
    {
        await using var rieng = new ChiTietFactory();
        rieng.DichVu.NemLoi = true;
        using var client = rieng.CreateHttpsClient();

        using var response = await client.GetAsync(Uri(Duong(DichVuChiTietGia.MaCo)), Ct);
        var than = await response.Content.ReadAsStringAsync(Ct);
        using var json = JsonDocument.Parse(than);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal("loi-he-thong", json.RootElement.GetProperty("code").GetString());
        Assert.False(string.IsNullOrEmpty(json.RootElement.GetProperty("maTraCuu").GetString()));
        Assert.DoesNotContain("bi-mat", than, StringComparison.Ordinal);
    }

    [Fact]
    public async Task VuotGioiHanDanhMuc_Tra429()
    {
        await using var gioiHan = new ChiTietGioiHanFactory();
        using var client = gioiHan.CreateHttpsClient();

        using var dau = await client.GetAsync(Uri(Duong(DichVuChiTietGia.MaCo)), Ct);
        using var sau = await client.GetAsync(Uri(Duong(DichVuChiTietGia.MaCo)), Ct);
        using var json = JsonDocument.Parse(await sau.Content.ReadAsStringAsync(Ct));

        Assert.Equal(HttpStatusCode.OK, dau.StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, sau.StatusCode);
        Assert.Equal("qua-nhieu-yeu-cau", json.RootElement.GetProperty("code").GetString());
    }
}

/// <summary>Dịch vụ thật trên file dữ liệu mẫu nhúng (nguồn Mẫu, không DB).</summary>
public sealed class ChiTietThuTucTrenFileNhungTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static Uri Uri(string duong) => new(duong, UriKind.Relative);

    [Fact]
    public async Task KhaiSinh_1_001193_DungNoiDungHopDong()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri("/api/thu-tuc/1.001193"), Ct);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));
        var goc = json.RootElement;

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("1.001193", goc.GetProperty("ma").GetString());
        Assert.Equal("Thủ tục đăng ký khai sinh", goc.GetProperty("ten").GetString());
        Assert.Equal("Hộ tịch", goc.GetProperty("linhVuc").GetString());
        Assert.Equal("toan-trinh", goc.GetProperty("mucDo").GetString());
        // Nguồn ghi thời hạn "1 Khác": không phải thời hạn thật.
        Assert.Equal(JsonValueKind.Null, goc.GetProperty("thoiHan").ValueKind);
        Assert.Equal(33, goc.GetProperty("thanhPhanHoSo").GetArrayLength());
        Assert.Equal(3, goc.GetProperty("hinhThucNop").GetArrayLength());
        Assert.NotNull(response.Headers.ETag);
        Assert.Equal(
            [
                "cachThuc", "canCu", "coQuanThucHien", "hinhThucNop", "ketQua", "linhVuc", "ma", "mucDo", "phi",
                "ten", "thanhPhanHoSo", "thoiHan", "trinhTu", "yeuCauDieuKien",
            ],
            [.. goc.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal)]);
    }

    [Fact]
    public async Task ThuTucLonNhat_1_013229_Tra200()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri("/api/thu-tuc/1.013229"), Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True((await response.Content.ReadAsByteArrayAsync(Ct)).Length > 40_000);
    }

    [Theory]
    [InlineData("9.999999")]
    [InlineData("abc%3Cb%3Ex%3C%2Fb%3E")]
    [InlineData("1.001193%20")]
    [InlineData("..%2Fx")]
    [InlineData("123456789012345678901")]
    public async Task MaLaHoacSaiDinhDang_Tra404_ThanKhongChuaMa(string ma)
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri($"/api/thu-tuc/{ma}"), Ct);
        var than = await response.Content.ReadAsStringAsync(Ct);
        using var json = JsonDocument.Parse(than);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("khong-tim-thay", json.RootElement.GetProperty("code").GetString());
        Assert.DoesNotContain(ma, than, StringComparison.Ordinal);
        Assert.DoesNotContain("abc", than, StringComparison.Ordinal);
    }
}

/// <summary>Nguồn Mẫu thật bọc bộ đếm: đếm số lần pipeline đọc phiên bản dữ liệu (<c>lan_nhap</c>).</summary>
public sealed class DemPhienBanFactory : ApiFactory
{
    public NguonDemTruyCap Nguon { get; private set; } = null!;

    protected override string PhienBanDuLieuGiu => "00:00:03";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<INguonDuLieu>();
            services.AddSingleton<INguonDuLieu>(sp =>
                Nguon = new NguonDemTruyCap(new NguonDuLieuMau(sp.GetRequiredService<TepDuLieuMau>())));
        });
    }
}

public sealed class PhienBanTrongPipelineTests
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static Uri Uri(string duong) => new(duong, UriKind.Relative);

    [Theory]
    [InlineData("1.001193")]
    [InlineData("9.999999")]
    public async Task MaDungDinhDang_ETagKhongKhop_DocPhienBanDungMotLan_VaMoiLanSauTrongThoiGianGiuKhongDocLai(string ma)
    {
        await using var rieng = new DemPhienBanFactory();
        using var client = rieng.CreateHttpsClient();
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, Uri($"/api/thu-tuc/{ma}"));
        yeuCau.Headers.IfNoneMatch.Add(new System.Net.Http.Headers.EntityTagHeaderValue("\"cu\""));

        using var dau = await client.SendAsync(yeuCau, Ct);
        var sauYeuCauDau = rieng.Nguon.SoLanTruyCapLanNhap;
        using var sau = await client.GetAsync(Uri($"/api/thu-tuc/{ma}"), Ct);

        Assert.Equal(1, sauYeuCauDau);
        Assert.Equal(1, rieng.Nguon.SoLanTruyCapLanNhap);
        Assert.NotEqual(HttpStatusCode.NotModified, dau.StatusCode);
        Assert.Equal(dau.StatusCode, sau.StatusCode);
    }

    [Fact]
    public async Task ETagKhop_Tra304_VaKhongDocPhienBanLaiTrongThoiGianGiu()
    {
        await using var rieng = new DemPhienBanFactory();
        using var client = rieng.CreateHttpsClient();
        using var dau = await client.GetAsync(Uri("/api/thu-tuc/1.001193"), Ct);
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, Uri("/api/thu-tuc/1.001193"));
        yeuCau.Headers.IfNoneMatch.Add(dau.Headers.ETag!);

        using var sau = await client.SendAsync(yeuCau, Ct);

        Assert.Equal(HttpStatusCode.NotModified, sau.StatusCode);
        Assert.Equal(1, rieng.Nguon.SoLanTruyCapLanNhap);
    }

    [Theory]
    [InlineData("...")]
    [InlineData("1.001193%20")]
    [InlineData("123456789012345678901")]
    public async Task MaSaiDinhDang_Tra404_KhongChamNguonDuLieuNaoCa(string ma)
    {
        await using var rieng = new DemPhienBanFactory();
        using var client = rieng.CreateHttpsClient();
        _ = await client.GetAsync(Uri("/health/live"), Ct);

        using var response = await client.GetAsync(Uri($"/api/thu-tuc/{ma}"), Ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        // Nguồn có thể chưa dựng nếu chưa ai cần: Nguon null nghĩa là chưa chạm.
        Assert.Equal(0, rieng.Nguon?.SoLanTruyCap ?? 0);
    }
}
