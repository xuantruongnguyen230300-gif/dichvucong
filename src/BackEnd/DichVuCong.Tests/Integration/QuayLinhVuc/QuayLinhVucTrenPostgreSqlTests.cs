using System.Net;
using System.Text.Json;
using DichVuCong.Api.Features.QuayLinhVuc;
using DichVuCong.Data;
using DichVuCong.Data.DuLieu;
using DichVuCong.Tests.Api.DuLieuThu;
using DichVuCong.Tests.Integration.DanhMuc;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Integration.QuayLinhVuc;

/// <summary>
/// F05 T11 (tester): tương đương hai nguồn từng byte và nhập lại <c>phan-cong</c> bằng công cụ nhập thật (F05 AC-6, QY-05, QY-06, QY-19).
/// Không có DB thử thì bỏ qua (không đỏ).
/// </summary>
public sealed class QuayLinhVucTrenPostgreSqlTests(DbThuNghiem db) : IClassFixture<DbThuNghiem>
{
    private static readonly JsonSerializerOptions Web = new(JsonSerializerDefaults.Web);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static async Task<string> DocAsync(HttpClient client, string duong = "/api/linh-vuc/quay")
    {
        using var r = await client.GetAsync(new Uri(duong, UriKind.Relative), Ct);
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        return await r.Content.ReadAsStringAsync(Ct);
    }

    [Fact]
    public async Task HaiNguon_BoDuLieuThu_DtoTuanTuHoaGiongTungByte()
    {
        db.CanCoDb();
        foreach (var tep in new[] { QuayLinhVucThu.Bo(), QuayLinhVucThu.Rong(), QuayLinhVucThu.ChiQuayTrong() })
        {
            var dsMau = new ServiceCollection();
            dsMau.AddDichVuCongDataMau(tep);
            using var goc = dsMau.BuildServiceProvider();
            var mau = await new QuayLinhVucService(goc.GetRequiredService<INguonDuLieu>()).LayAsync(Ct);

            db.Nap(tep);
            using var dichVu = db.TaoDichVu();
            using var scope = dichVu.CreateScope();
            var pg = await new QuayLinhVucService(scope.ServiceProvider.GetRequiredService<INguonDuLieu>()).LayAsync(Ct);

            Assert.Equal(JsonSerializer.Serialize(mau, Web), JsonSerializer.Serialize(pg, Web));
        }
    }

    [Fact]
    public async Task Http_NguonMauVaPostgreSql_CungThanTungByte_KhiPhanCongRong()
    {
        db.CanCoDb();
        db.Nap(DoDac.DocFileNhung());
        await using var fMau = new MauApiFactoryDo();
        await using var fPg = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var cMau = fMau.CreateHttpsClient();
        using var cPg = fPg.CreateHttpsClient();

        var a = await DocAsync(cMau);
        var b = await DocAsync(cPg);

        Assert.Equal("[]", a);
        Assert.Equal(a, b);
        using var r = await cPg.GetAsync(new Uri("/api/linh-vuc/quay", UriKind.Relative), Ct);
        Assert.NotNull(r.Headers.ETag);
        Assert.Equal("no-cache", r.Headers.CacheControl?.ToString());
        Assert.False(r.Headers.Contains("Server"));
    }

    [Fact]
    public async Task AC6_NhapPhanCongBangCongCuNhap_RongRoiCoHoTichQuay3_ApiDoiNgay_ETagDoi_KhongKhoiDongLai()
    {
        db.CanCoDb();
        db.XoaHet();
        using var thuMuc = new ThuMucTam();
        var thuTuc = new List<ThuTucNhap>
        {
            new("1.001193", "Thủ tục đăng ký khai sinh", "Hộ tịch", true, true),
            new("9.201", "Đăng ký thế chấp", "Đất đai", false, true, "Một phần"),
            new("9.301", "Chứng thực bản sao", "Chứng thực", true, true),
        };

        // (a) file phan-cong không dòng nào -> []
        BoFileNhap.Tao(thuMuc.DuongDan, thuTuc, ["1.001193"]);
        var (m1, _, l1) = await BoFileNhap.NhapAsync(db.ChuoiKetNoi!, thuMuc.DuongDan);
        Assert.True(m1 == 0, l1);
        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();
        using var lan1 = await client.GetAsync(new Uri("/api/linh-vuc/quay", UriKind.Relative), Ct);
        var etag1 = lan1.Headers.ETag;
        Assert.Equal("[]", await lan1.Content.ReadAsStringAsync(Ct));
        Assert.NotNull(etag1);

        using (var yc = new HttpRequestMessage(HttpMethod.Get, "/api/linh-vuc/quay"))
        {
            yc.Headers.IfNoneMatch.Add(etag1);
            using var tra = await client.SendAsync(yc, Ct);
            Assert.Equal(HttpStatusCode.NotModified, tra.StatusCode);
        }

        // (b) nhập lại: Hộ tịch quầy 3; Đất đai chỉ có nơi tiếp nhận chuyển (quầy trống) -> không xuất hiện; không khởi động lại API
        await Task.Delay(50, Ct);
        File.Delete(Path.Combine(thuMuc.DuongDan, "phan-cong.xlsx"));
        BoFileNhap.Tao(
            thuMuc.DuongDan, thuTuc, ["1.001193"],
            phanCong: [new PhanCongNhap("Hộ tịch", 3), new PhanCongNhap("Đất đai", null, "Chi nhánh thử")]);
        var (m2, _, l2) = await BoFileNhap.NhapAsync(db.ChuoiKetNoi!, thuMuc.DuongDan);
        Assert.True(m2 == 0, l2);

        using var yeuCauCu = new HttpRequestMessage(HttpMethod.Get, "/api/linh-vuc/quay");
        yeuCauCu.Headers.IfNoneMatch.Add(etag1);
        using var lan2 = await client.SendAsync(yeuCauCu, Ct);
        Assert.Equal(HttpStatusCode.OK, lan2.StatusCode);
        Assert.NotEqual(etag1, lan2.Headers.ETag);
        Assert.Equal("""[{"linhVucMa":"ho-tich","quay":3}]""", await lan2.Content.ReadAsStringAsync(Ct));

        // QY-19: tên viết HOA, nhiều dấu cách vẫn khớp mã ho-tich (mã sinh bằng cùng TaoMaDuongDan)
        await Task.Delay(50, Ct);
        File.Delete(Path.Combine(thuMuc.DuongDan, "phan-cong.xlsx"));
        BoFileNhap.Tao(thuMuc.DuongDan, thuTuc, ["1.001193"], phanCong: [new PhanCongNhap("HỘ   TỊCH", 7)]);
        var (m3, _, l3) = await BoFileNhap.NhapAsync(db.ChuoiKetNoi!, thuMuc.DuongDan);
        Assert.True(m3 == 0, l3);
        Assert.Equal("""[{"linhVucMa":"ho-tich","quay":7}]""", await DocAsync(client));

        // Nhập lại file rỗng -> trở về []
        await Task.Delay(50, Ct);
        File.Delete(Path.Combine(thuMuc.DuongDan, "phan-cong.xlsx"));
        BoFileNhap.Tao(thuMuc.DuongDan, thuTuc, ["1.001193"]);
        Assert.Equal(0, (await BoFileNhap.NhapAsync(db.ChuoiKetNoi!, thuMuc.DuongDan)).Ma);
        Assert.Equal("[]", await DocAsync(client));
    }

    [Fact]
    public async Task Http_ThamSoLaKhongDoiMucCache_VaPostBi405()
    {
        db.CanCoDb();
        db.Nap(QuayLinhVucThu.Bo());
        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();

        var a = await DocAsync(client, "/api/linh-vuc/quay?x=1");
        var b = await DocAsync(client, "/api/linh-vuc/quay?x=2");
        Assert.Equal(a, b);
        using var post = await client.PostAsync(new Uri("/api/linh-vuc/quay", UriKind.Relative), new StringContent("{}"), Ct);
        Assert.Equal(HttpStatusCode.MethodNotAllowed, post.StatusCode);
    }
}
