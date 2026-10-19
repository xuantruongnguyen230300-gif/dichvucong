using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Common.Errors;
using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>Nguồn dữ liệu có thể đổi nội dung giữa hai yêu cầu (kiểm chỉ mục dựng lại khi phiên bản dữ liệu đổi).</summary>
public sealed class NguonDoiDuoc(INguonDuLieu goc) : INguonDuLieu
{
    public INguonDuLieu Goc { get; set; } = goc;

    public IQueryable<DichVuCong.Data.Entities.ThuTuc> ThuTucs => Goc.ThuTucs;

    public IQueryable<DichVuCong.Data.Entities.LinhVuc> LinhVucs => Goc.LinhVucs;

    public IQueryable<DichVuCong.Data.Entities.PhanCongLinhVuc> PhanCongLinhVucs => Goc.PhanCongLinhVucs;

    public IQueryable<DichVuCong.Data.Entities.NhanSu> NhanSus => Goc.NhanSus;

    public IQueryable<DichVuCong.Data.Entities.TrungTam> TrungTams => Goc.TrungTams;

    public IQueryable<DichVuCong.Data.Entities.GioLamViec> GioLamViecs => Goc.GioLamViecs;

    public IQueryable<DichVuCong.Data.Entities.LienKet> LienKets => Goc.LienKets;

    public IQueryable<DichVuCong.Data.Entities.ODichVu> ODichVus => Goc.ODichVus;

    public IQueryable<DichVuCong.Data.Entities.CauHoiMau> CauHoiMaus => Goc.CauHoiMaus;

    public IQueryable<DichVuCong.Data.Entities.CauHoiMauCachHoi> CauHoiMauCachHois => Goc.CauHoiMauCachHois;

    public IQueryable<DichVuCong.Data.Entities.ChuDeGoiY> ChuDeGoiYs => Goc.ChuDeGoiYs;

    public IQueryable<DichVuCong.Data.Entities.TuDongNghia> TuDongNghias => Goc.TuDongNghias;

    public IQueryable<DichVuCong.Data.Entities.VietTat> VietTats => Goc.VietTats;

    public IQueryable<DichVuCong.Data.Entities.LanNhap> LanNhaps => Goc.LanNhaps;
}

/// <summary>API nguồn Mẫu (file nhúng thật) với giới hạn <c>tro-ly</c> rất lớn, phiên bản dữ liệu giả và nguồn đổi được.</summary>
public class TroLyFactory : ApiFactory
{
    public PhienBanGia PhienBan { get; } = new();

    public NguonDoiDuoc Nguon { get; } = new(new NguonDuLieuMau(TepDuLieuMau.Nhung));

    internal BoGhiLog LogLoi { get; } = new(ProblemDetailsCustomizer.TenLogger);

    /// <summary>Giá trị <c>RateLimiting:TroLy</c>.</summary>
    protected virtual string GioiHanTroLy => "100000";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.UseSetting("RateLimiting:TroLy", GioiHanTroLy);
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IPhienBanDuLieu>();
            services.AddSingleton<IPhienBanDuLieu>(PhienBan);
            services.RemoveAll<INguonDuLieu>();
            services.AddSingleton<INguonDuLieu>(Nguon);
            services.AddLogging(b => b.AddProvider(LogLoi));
        });
    }

    internal KhoCauChuaTraLoiMau Kho => (KhoCauChuaTraLoiMau)Services.GetRequiredService<IKhoCauChuaTraLoi>();
}

public sealed class TroLyGioiHan5Factory : TroLyFactory
{
    protected override string GioiHanTroLy => "5";
}

public sealed class TroLyGioiHanMacDinhFactory : TroLyFactory
{
    protected override string GioiHanTroLy => "60";
}

public sealed class TroLyKhoLoiFactory : TroLyFactory
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IKhoCauChuaTraLoi>();
            services.AddSingleton<IKhoCauChuaTraLoi>(new KhoGhiLai { NemLoi = true });
        });
    }
}

/// <summary>HTTP của <c>/api/tro-ly</c> (F06 plan §3, §3.4, §9 bảng TroLyTests).</summary>
public sealed class TroLyTests(TroLyFactory factory) : IClassFixture<TroLyFactory>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static readonly string[] CacTruongDapAn =
    [
        "canBo", "chuDe", "danhSachThuTuc", "lienHe", "linhVuc", "loai", "muc", "noiDung", "noiTiepNhanChuyen", "quay", "thongTin",
        "thuTuc", "thuTucDangNoi", "thuTucKhac", "tong", "traLoi", "trungTam",
    ];

    private static Uri Uri(string duong) => new(duong, UriKind.Relative);

    private static StringContent Json(string noiDung, string loai = "application/json") => new(noiDung, Encoding.UTF8, loai);

    private static async Task<JsonDocument> DocAsync(HttpResponseMessage response)
        => JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));

    private static Task<HttpResponseMessage> HoiAsync(HttpClient client, string cau, string? ma = null)
        => client.PostAsJsonAsync(Uri("/api/tro-ly/hoi"), new { cauHoi = cau, maThuTuc = ma }, Ct);

    [Fact]
    public async Task Hoi_Tra200_JsonCamelCase_DuMoiTruongKeCaNull()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await HoiAsync(client, "khai sinh");
        using var json = await DocAsync(response);
        var goc = json.RootElement;

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType?.ToString());
        Assert.Equal(CacTruongDapAn, goc.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal));
        Assert.Equal("thu-tuc-danh-sach", goc.GetProperty("loai").GetString());
        Assert.Equal("1.001193", goc.GetProperty("thuTucDangNoi").GetString());
        Assert.Equal(JsonValueKind.Null, goc.GetProperty("muc").ValueKind);
        Assert.Equal(JsonValueKind.Null, goc.GetProperty("noiDung").ValueKind);
        Assert.Equal(JsonValueKind.Array, goc.GetProperty("danhSachThuTuc").ValueKind);
        var dau = goc.GetProperty("danhSachThuTuc")[0];
        Assert.Equal(["capTinh", "capXa", "linhVuc", "ma", "mucDo", "ten"], dau.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal));
        Assert.Equal("toan-trinh", dau.GetProperty("mucDo").GetString());
        Assert.True(dau.GetProperty("capXa").GetBoolean());
    }

    [Fact]
    public async Task Hoi_ThuTucMucHoSo_NoiDungDuTruong_VaKhongLoMaDvcHayTruongNoiBo()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await HoiAsync(client, "làm giấy khai sinh cần giấy tờ gì");
        var chuoi = await response.Content.ReadAsStringAsync(Ct);
        using var json = JsonDocument.Parse(chuoi);
        var nd = json.RootElement.GetProperty("noiDung");

        Assert.Equal("ho-so", json.RootElement.GetProperty("muc").GetString());
        Assert.Equal(
            ["canCu", "hinhThucNop", "ketQua", "phi", "thanhPhanHoSo", "thoiHan", "tong", "trinhTu"],
            nd.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal));
        Assert.True(nd.GetProperty("thanhPhanHoSo").GetArrayLength() > 0);
        Assert.Equal(JsonValueKind.Null, nd.GetProperty("trinhTu").ValueKind);
        Assert.DoesNotContain("maDvc", chuoi, StringComparison.Ordinal);
        Assert.DoesNotContain("tenTimKiem", chuoi, StringComparison.Ordinal);
        Assert.DoesNotContain("1.001193.02", chuoi, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Hoi_500KyTu_Tra200_VaKhongGhiKhoNeuTraLoiDuoc()
    {
        using var client = factory.CreateHttpsClient();
        var cau = "khai sinh " + new string('a', 490);

        using var response = await HoiAsync(client, cau);

        Assert.Equal(500, cau.Length);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(" \t\n ")]
    public async Task Hoi_CauRongHayToanKhoangTrang_Tra400_DuLieuKhongHopLe(string cau)
    {
        using var client = factory.CreateHttpsClient();

        using var response = await HoiAsync(client, cau);
        using var json = await DocAsync(response);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("du-lieu-khong-hop-le", json.RootElement.GetProperty("code").GetString());
        Assert.False(string.IsNullOrEmpty(json.RootElement.GetProperty("maTraCuu").GetString()));
    }

    [Fact]
    public async Task Hoi_ChiCoKyTuVoHinh_Tra400()
    {
        using var client = factory.CreateHttpsClient();
        var voHinh = new string([(char)0x200B, (char)0x200E, (char)0xFEFF, ' ']);

        using var response = await HoiAsync(client, voHinh);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Hoi_501KyTu_Tra400_KhongGhiKho_KhongNhacLaiNoiDung()
    {
        using var client = factory.CreateHttpsClient();
        var truoc = factory.Kho.ChupCacDong().Count;
        var cau = "MAT-KHAU-BI-MAT-12345 " + new string('b', 479);

        using var response = await HoiAsync(client, cau);
        var chuoi = await response.Content.ReadAsStringAsync(Ct);

        Assert.Equal(501, cau.Length);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.DoesNotContain("MAT-KHAU-BI-MAT", chuoi, StringComparison.Ordinal);
        Assert.Equal(truoc, factory.Kho.ChupCacDong().Count);
        while (factory.LogLoi.ConDongChuaDoc)
        {
            var ghi = await factory.LogLoi.DocAsync();
            Assert.DoesNotContain("MAT-KHAU-BI-MAT", ghi.NoiDung, StringComparison.Ordinal);
        }
    }

    [Theory]
    [InlineData("{}")]
    [InlineData("{\"cauHoi\":null}")]
    [InlineData("{\"cauHoi\":123}")]
    [InlineData("{\"cauHoi\":\"khai sinh\",\"maThuTuc\":\"01234567890123456789012345\"}")]
    [InlineData("không phải json")]
    [InlineData("{\"cauHoi\":\"CHUOI-BI-MAT\"")]
    public async Task Hoi_BodyKhongHopLe_Tra400_KhongNhacLaiNoiDung(string body)
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.PostAsync(Uri("/api/tro-ly/hoi"), Json(body), Ct);
        var chuoi = await response.Content.ReadAsStringAsync(Ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("du-lieu-khong-hop-le", chuoi, StringComparison.Ordinal);
        Assert.DoesNotContain("CHUOI-BI-MAT", chuoi, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Hoi_KhongPhaiJson_Tra4xxDuLieuKhongHopLe()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.PostAsync(Uri("/api/tro-ly/hoi"), Json("cauHoi=khai+sinh", "application/x-www-form-urlencoded"), Ct);
        using var json = await DocAsync(response);

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
        Assert.Equal("du-lieu-khong-hop-le", json.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Hoi_BodyLonHon64KB_Tra413_YeuCauQuaLon()
    {
        using var client = factory.CreateHttpsClient();
        var body = "{\"cauHoi\":\"" + new string('a', 70_000) + "\"}";

        using var response = await client.PostAsync(Uri("/api/tro-ly/hoi"), Json(body), Ct);
        using var json = await DocAsync(response);

        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, response.StatusCode);
        Assert.Equal("yeu-cau-qua-lon", json.RootElement.GetProperty("code").GetString());
    }

    [Theory]
    [InlineData("PUT", "/api/tro-ly/hoi")]
    [InlineData("DELETE", "/api/tro-ly/chu-de")]
    public async Task PhuongThucKhac_Tra405(string phuongThuc, string duong)
    {
        using var client = factory.CreateHttpsClient();
        using var request = new HttpRequestMessage(new HttpMethod(phuongThuc), Uri(duong));

        using var response = await client.SendAsync(request, Ct);
        using var json = await DocAsync(response);

        Assert.Equal(HttpStatusCode.MethodNotAllowed, response.StatusCode);
        Assert.Equal("phuong-thuc-khong-hop-le", json.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Get_TrenRouteChiCoPost_Tra405_KemAllowPost()
    {
        // SpaFallback nhận ra route chỉ có POST nên không trả 404 (G1 trong F06 test.md).
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri("/api/tro-ly/hoi"), Ct);
        using var json = await DocAsync(response);

        Assert.Equal(HttpStatusCode.MethodNotAllowed, response.StatusCode);
        Assert.Equal("phuong-thuc-khong-hop-le", json.RootElement.GetProperty("code").GetString());
        Assert.Equal(["POST"], response.Content.Headers.Allow);
    }

    [Fact]
    public async Task ChuDe_Post_ChuDeBon_ChanNuoi()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.PostAsJsonAsync(Uri("/api/tro-ly/chu-de"), new { thuTu = 4, maThuTuc = (string?)null }, Ct);
        using var json = await DocAsync(response);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("chu-de", json.RootElement.GetProperty("loai").GetString());
        Assert.Equal("Chăn nuôi", json.RootElement.GetProperty("chuDe").GetProperty("tenHienThi").GetString());
        Assert.Equal(CacTruongDapAn, json.RootElement.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal));
    }

    [Theory]
    [InlineData(7)]
    [InlineData(999)]
    public async Task ChuDe_Post_KhongCoThuTu_Tra404_KhongTimThay(int thuTu)
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.PostAsJsonAsync(Uri("/api/tro-ly/chu-de"), new { thuTu, maThuTuc = (string?)null }, Ct);
        using var json = await DocAsync(response);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("khong-tim-thay", json.RootElement.GetProperty("code").GetString());
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(1001)]
    public async Task ChuDe_Post_ThuTuNgoaiKhoang_Tra400(int thuTu)
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.PostAsJsonAsync(Uri("/api/tro-ly/chu-de"), new { thuTu, maThuTuc = (string?)null }, Ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ChuDe_Get_SauChuDeTheoThuTu_ETagNoCache_304()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Uri("/api/tro-ly/chu-de"), Ct);
        using var json = await DocAsync(response);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(6, json.RootElement.GetArrayLength());
        Assert.Equal([1, 2, 3, 4, 5, 6], json.RootElement.EnumerateArray().Select(c => c.GetProperty("thuTu").GetInt32()));
        Assert.Equal(["tenHienThi", "thuTu"], json.RootElement[0].EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal));
        Assert.Equal("Đất đai", json.RootElement[0].GetProperty("tenHienThi").GetString());
        Assert.NotNull(response.Headers.ETag);
        Assert.Equal("no-cache", response.Headers.CacheControl?.ToString());

        using var request = new HttpRequestMessage(HttpMethod.Get, Uri("/api/tro-ly/chu-de"));
        request.Headers.TryAddWithoutValidation(HeaderNames.IfNoneMatch, response.Headers.ETag!.ToString());
        using var daCo = await client.SendAsync(request, Ct);

        Assert.Equal(HttpStatusCode.NotModified, daCo.StatusCode);
    }

    [Fact]
    public async Task ChuDe_Get_DoiPhienBanDuLieu_ChiMucDungLaiVaTraChuDeMoi()
    {
        await using var rieng = new TroLyFactory();
        using var client = rieng.CreateHttpsClient();
        using var truoc = await client.GetAsync(Uri("/api/tro-ly/chu-de"), Ct);
        using var jsonTruoc = await DocAsync(truoc);

        rieng.Nguon.Goc = new NguonDuLieuMau(TroLyThu.BotMotChuDe());
        rieng.PhienBan.GiaTri += 1;
        using var sau = await client.GetAsync(Uri("/api/tro-ly/chu-de"), Ct);
        using var jsonSau = await DocAsync(sau);

        Assert.Equal(6, jsonTruoc.RootElement.GetArrayLength());
        Assert.Equal(5, jsonSau.RootElement.GetArrayLength());
        Assert.NotEqual(truoc.Headers.ETag, sau.Headers.ETag);
    }

    [Fact]
    public async Task Hoi_KhongHieu_GhiKhoMauBanDaChe_HaiLanMotDongHaiLanGap()
    {
        await using var rieng = new TroLyFactory();
        using var client = rieng.CreateHttpsClient();

        await HoiAsync(client, "giá vàng hôm nay");
        await HoiAsync(client, "GIÁ VÀNG HÔM NAY");
        await HoiAsync(client, "số 0912345678 của tôi nộp hồ sơ chưa");
        await HoiAsync(client, "CCCD 079123456789, email nguyenvana@gmail.com, hồ sơ của tôi đâu");

        var dong = rieng.Kho.ChupCacDong();
        Assert.Equal(3, dong.Count);
        Assert.Equal(2, dong.Single(d => d.NoiDung == "giá vàng hôm nay").SoLanGap);
        Assert.Contains(dong, d => d.NoiDung == "số 09******78 của tôi nộp hồ sơ chưa");
        Assert.Contains(dong, d => d.NoiDung.Contains("07********89", StringComparison.Ordinal) && d.NoiDung.Contains("n***@gmail.com", StringComparison.Ordinal));
        Assert.DoesNotContain(dong, d => d.NoiDung.Contains("0912345678", StringComparison.Ordinal) || d.NoiDung.Contains("nguyenvana", StringComparison.Ordinal));
    }

    [Fact]
    public async Task Hoi_KhoLoi_VanTra200KhongHieu()
    {
        await using var rieng = new TroLyKhoLoiFactory();
        using var client = rieng.CreateHttpsClient();

        using var response = await HoiAsync(client, "giá vàng hôm nay");
        using var json = await DocAsync(response);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("khong-hieu", json.RootElement.GetProperty("loai").GetString());
    }

    [Fact]
    public async Task GioiHan_NamCauDauCoTraLoi_CauThuSauBi429_KhongLoiTrang()
    {
        await using var rieng = new TroLyGioiHan5Factory();
        using var client = rieng.CreateHttpsClient();

        for (var i = 0; i < 5; i++)
        {
            using var ok = await HoiAsync(client, "khai sinh");
            Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        }

        using var bi = await HoiAsync(client, "khai sinh");
        using var json = await DocAsync(bi);

        Assert.Equal(HttpStatusCode.TooManyRequests, bi.StatusCode);
        Assert.Equal("qua-nhieu-yeu-cau", json.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task GioiHan_MacDinh60_Cau61Bi429_ChipChuDeCungBoDem_GetChipDungBoDemDanhMuc()
    {
        await using var rieng = new TroLyGioiHanMacDinhFactory();
        using var client = rieng.CreateHttpsClient();

        for (var i = 0; i < 59; i++)
        {
            using var ok = await HoiAsync(client, "khai sinh");
            Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        }

        using var chip = await client.PostAsJsonAsync(Uri("/api/tro-ly/chu-de"), new { thuTu = 1, maThuTuc = (string?)null }, Ct);
        using var hoi61 = await HoiAsync(client, "khai sinh");
        using var getChip = await client.GetAsync(Uri("/api/tro-ly/chu-de"), Ct);

        Assert.Equal(HttpStatusCode.OK, chip.StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, hoi61.StatusCode);
        Assert.Equal(HttpStatusCode.OK, getChip.StatusCode);
    }
}
