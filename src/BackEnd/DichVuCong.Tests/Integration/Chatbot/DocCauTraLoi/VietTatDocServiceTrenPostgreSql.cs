using System.Net;
using System.Text.Json;
using DichVuCong.Api.Features.Chatbot.DocCauTraLoi;
using DichVuCong.Data;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using DichVuCong.Tests.Api.Chatbot;
using DichVuCong.Tests.Api.Chatbot.DocCauTraLoi;
using DichVuCong.Tests.Integration.DanhMuc;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Integration.Chatbot.DocCauTraLoi;

/// <summary>
/// Lớp con PostgreSQL của test hợp đồng <see cref="VietTatDocServiceContract"/> (F07 T09): cùng các ca và kỳ vọng như nguồn Mẫu,
/// chỉ khác nguồn là DB thật. Không có DB thử thì bỏ qua.
/// </summary>
public sealed class VietTatDocServiceTrenPostgreSql(DbThuNghiem db)
    : VietTatDocServiceContract, IClassFixture<DbThuNghiem>, IDisposable
{
    private readonly List<IDisposable> _canGiaiPhong = [];

    protected override INguonDuLieu TaoNguon(TepDuLieuMau tep)
    {
        db.CanCoDb();
        db.Nap(tep);

        var dichVu = db.TaoDichVu();
        var scope = dichVu.CreateScope();
        _canGiaiPhong.Add(scope);
        _canGiaiPhong.Add(dichVu);
        return scope.ServiceProvider.GetRequiredService<INguonDuLieu>();
    }

    public void Dispose()
    {
        foreach (var doiTuong in _canGiaiPhong)
        {
            doiTuong.Dispose();
        }
    }
}

/// <summary>JSON giống hệt giữa hai nguồn; nhập lại <c>tro-ly</c> bằng công cụ nhập thì <c>GET /api/tro-ly/viet-tat</c> thấy dòng mới và ETag đổi (F07 T09).</summary>
public sealed class VietTatDocTrenPostgreSqlTests(DbThuNghiem db) : IClassFixture<DbThuNghiem>
{
    private static readonly JsonSerializerOptions Web = new(JsonSerializerDefaults.Web);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task HaiNguon_DichVu_CungJsonTungByte()
    {
        db.CanCoDb();
        db.Nap(TroLyThu.Nen());
        var dsMau = new ServiceCollection();
        dsMau.AddDichVuCongDataMau(TroLyThu.Nen());
        using var goc = dsMau.BuildServiceProvider();
        var mau = await new VietTatDocService(goc.GetRequiredService<INguonDuLieu>()).LayAsync(Ct);

        using var dichVu = db.TaoDichVu();
        using var scope = dichVu.CreateScope();
        var pg = await new VietTatDocService(scope.ServiceProvider.GetRequiredService<INguonDuLieu>()).LayAsync(Ct);

        Assert.Equal(12, pg.Count);
        Assert.Equal(JsonSerializer.Serialize(mau, Web), JsonSerializer.Serialize(pg, Web));
    }

    [Fact]
    public async Task Http_HaiNguon_CungThanTungByte_ChiHaiTruong_ETagVaCache()
    {
        db.CanCoDb();
        db.Nap(DoDac.DocFileNhung());
        await using var fMau = new MauApiFactoryDo();
        await using var fPg = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var cMau = fMau.CreateHttpsClient();
        using var cPg = fPg.CreateHttpsClient();

        using var a = await cMau.GetAsync(new Uri("/api/tro-ly/viet-tat", UriKind.Relative), Ct);
        using var b = await cPg.GetAsync(new Uri("/api/tro-ly/viet-tat", UriKind.Relative), Ct);
        var ta = await a.Content.ReadAsByteArrayAsync(Ct);
        var tb = await b.Content.ReadAsByteArrayAsync(Ct);

        Assert.Equal(HttpStatusCode.OK, b.StatusCode);
        Assert.True(ta.AsSpan().SequenceEqual(tb), "Thân khác nhau giữa nguồn Mẫu và PostgreSQL.");
        Assert.NotNull(b.Headers.ETag);
        Assert.Equal("no-cache", b.Headers.CacheControl?.ToString());
        Assert.False(b.Headers.Contains("Server"));
        using var json = JsonDocument.Parse(tb);
        Assert.Equal(12, json.RootElement.GetArrayLength());
        Assert.Equal(["chuVietTat", "dayDu"], [.. json.RootElement[0].EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal)]);
    }

    [Fact]
    public async Task NhapTroLyThemMotVietTat_ApiThayDongMoi_ETagDoi_Khong304Cu()
    {
        db.CanCoDb();
        db.XoaHet();
        using var thuMuc = new ThuMucTam();
        var thuTuc = new List<ThuTucNhap> { new("1.001193", "Thủ tục đăng ký khai sinh", "Hộ tịch", true, true) };

        BoFileNhap.Tao(thuMuc.DuongDan, thuTuc, ["1.001193"]);
        var (m1, _, l1) = await BoFileNhap.NhapAsync(db.ChuoiKetNoi!, thuMuc.DuongDan);
        Assert.True(m1 == 0, l1);

        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();
        using var lan1 = await client.GetAsync(new Uri("/api/tro-ly/viet-tat", UriKind.Relative), Ct);
        var etag1 = lan1.Headers.ETag;
        Assert.Equal("""[{"chuVietTat":"TTHC","dayDu":"thủ tục hành chính"}]""", await lan1.Content.ReadAsStringAsync(Ct));

        using (var yc304 = new HttpRequestMessage(HttpMethod.Get, "/api/tro-ly/viet-tat"))
        {
            yc304.Headers.IfNoneMatch.Add(etag1!);
            using var r304 = await client.SendAsync(yc304, Ct);
            Assert.Equal(HttpStatusCode.NotModified, r304.StatusCode);
        }

        // Nhập lại tro-ly với một dòng viết tắt mới ("UBND"), không khởi động lại API.
        await Task.Delay(50, Ct);
        File.Delete(Path.Combine(thuMuc.DuongDan, "tro-ly.xlsx"));
        BoFileNhap.Tao(thuMuc.DuongDan, thuTuc, ["1.001193"], vietTatThem: [("UBND", "Ủy ban nhân dân")]);
        var (m2, _, l2) = await BoFileNhap.NhapAsync(db.ChuoiKetNoi!, thuMuc.DuongDan);
        Assert.True(m2 == 0, l2);

        using var yeuCauCu = new HttpRequestMessage(HttpMethod.Get, "/api/tro-ly/viet-tat");
        yeuCauCu.Headers.IfNoneMatch.Add(etag1!);
        using var lan2 = await client.SendAsync(yeuCauCu, Ct);

        Assert.Equal(HttpStatusCode.OK, lan2.StatusCode);
        Assert.NotEqual(etag1, lan2.Headers.ETag);
        Assert.Equal(
            """[{"chuVietTat":"TTHC","dayDu":"thủ tục hành chính"},{"chuVietTat":"UBND","dayDu":"Ủy ban nhân dân"}]""",
            await lan2.Content.ReadAsStringAsync(Ct));
    }
}
