using System.Net;
using System.Text.Json;
using DichVuCong.Api.Features.DanhMuc;
using DichVuCong.Data;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Entities;
using DichVuCong.Data.Mau;
using DichVuCong.Tests.Api;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Integration.DanhMuc;

/// <summary>
/// Lớp con PostgreSQL của test hợp đồng <see cref="DanhMucServiceContract"/> (plan F00 §9.10, T31; F04 T14, ca HD-02, HD-03, HD-05):
/// cùng các ca và kỳ vọng như nguồn Mẫu, chỉ khác nguồn là DB thật. Không có DB thử thì bỏ qua.
/// </summary>
public sealed class DanhMucServiceTrenPostgreSql(DbThuNghiem db)
    : DanhMucServiceContract, IClassFixture<DbThuNghiem>, IDisposable
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

/// <summary>Tương đương hai nguồn, nhập lại bằng công cụ nhập, SQL và đo p95 trên DB thật cho <c>/api/thu-tuc</c> và <c>/api/linh-vuc</c> (F04 T14).</summary>
public sealed class DanhMucTrenPostgreSqlTests(DbThuNghiem db) : IClassFixture<DbThuNghiem>
{
    private static readonly JsonSerializerOptions Web = new(JsonSerializerDefaults.Web);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task HD01_DichVu_NguonMauVaPostgreSql_CungJsonTungByte_VaDemDung()
    {
        db.CanCoDb();
        db.Nap(DoDac.DocFileNhung());
        var mauServices = new ServiceCollection();
        mauServices.AddDichVuCongDataMau(DoDac.DocFileNhung());
        using var mauGoc = mauServices.BuildServiceProvider();
        var mau = new DanhMucService(mauGoc.GetRequiredService<INguonDuLieu>());
        using var dichVu = db.TaoDichVu();
        using var scope = dichVu.CreateScope();
        var pg = new DanhMucService(scope.ServiceProvider.GetRequiredService<INguonDuLieu>());

        var thuTucMau = await mau.LayThuTucAsync(Ct);
        var thuTucPg = await pg.LayThuTucAsync(Ct);
        var linhVucMau = await mau.LayLinhVucAsync(Ct);
        var linhVucPg = await pg.LayLinhVucAsync(Ct);

        Assert.Equal(JsonSerializer.Serialize(thuTucMau, Web), JsonSerializer.Serialize(thuTucPg, Web));
        Assert.Equal(JsonSerializer.Serialize(linhVucMau, Web), JsonSerializer.Serialize(linhVucPg, Web));
        // HD-02: 408 thủ tục, xã 266, tỉnh 408, 75 lĩnh vực, 16 thường gặp.
        Assert.Equal(408, thuTucPg.Count);
        Assert.Equal(266, thuTucPg.Count(t => t.CapXa));
        Assert.Equal(408, thuTucPg.Count(t => t.CapTinh));
        Assert.Equal(75, linhVucPg.Count);
        Assert.Equal(16, thuTucPg.Count(t => t.ThuTuThuongGap is not null));
    }

    [Fact]
    public async Task Http_HD01_HaiApi_NguonMauVaPostgreSql_CungThanTungByte_ChiCoMuoiVaNamKhoa()
    {
        db.CanCoDb();
        db.Nap(DoDac.DocFileNhung());
        await using var fMau = new MauApiFactoryDo();
        await using var fPg = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var cMau = fMau.CreateHttpsClient();
        using var cPg = fPg.CreateHttpsClient();

        foreach (var duong in new[] { "/api/thu-tuc", "/api/linh-vuc" })
        {
            using var a = await cMau.GetAsync(new Uri(duong, UriKind.Relative), Ct);
            using var b = await cPg.GetAsync(new Uri(duong, UriKind.Relative), Ct);
            var ta = await a.Content.ReadAsByteArrayAsync(Ct);
            var tb = await b.Content.ReadAsByteArrayAsync(Ct);
            Assert.Equal(HttpStatusCode.OK, b.StatusCode);
            Assert.True(ta.AsSpan().SequenceEqual(tb), $"{duong}: thân khác nhau giữa nguồn Mẫu ({ta.Length} B) và PostgreSQL ({tb.Length} B)");
            Assert.True(b.Headers.Contains("ETag"));
            Assert.Equal("no-cache", b.Headers.CacheControl?.ToString());
            Assert.False(b.Headers.Contains("Server"));
        }

        using var thuTuc = await cPg.GetAsync(new Uri("/api/thu-tuc", UriKind.Relative), Ct);
        using var jsonTt = JsonDocument.Parse(await thuTuc.Content.ReadAsStringAsync(Ct));
        Assert.Equal(
            ["capTinh", "capXa", "coQuanThucHien", "linhVucMa", "ma", "mucDo", "ten", "tenTimKiem", "thoiHan", "thuTuThuongGap"],
            [.. jsonTt.RootElement[0].EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal)]);
        using var linhVuc = await cPg.GetAsync(new Uri("/api/linh-vuc", UriKind.Relative), Ct);
        using var jsonLv = JsonDocument.Parse(await linhVuc.Content.ReadAsStringAsync(Ct));
        Assert.Equal(
            ["ma", "soThuTucTinh", "soThuTucXa", "ten", "tenTimKiem"],
            [.. jsonLv.RootElement[0].EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal)]);
    }

    [Fact]
    public async Task HD12_ThuTucKhongThuocCapNao_DbTuChoi_VaMoiThuTucTrongDanhMucThuocItNhatMotCap()
    {
        db.CanCoDb();
        var tep = DoDac.DocFileNhung();
        tep.ThuTuc[0].ThuocDanhMucXa = false;
        tep.ThuTuc[0].ThuocDanhMucTinh = false;

        // Ràng buộc ck_thu_tuc_danh_muc: không thể có thủ tục ngoài cả hai cấp trong PostgreSQL.
        var loi = Assert.Throws<DbUpdateException>(() => db.Nap(tep));
        Assert.Contains("ck_thu_tuc_danh_muc", loi.InnerException?.Message ?? string.Empty, StringComparison.Ordinal);

        db.Nap(DoDac.DocFileNhung());
        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();
        using var thuTuc = await client.GetAsync(new Uri("/api/thu-tuc", UriKind.Relative), Ct);
        using var jt = JsonDocument.Parse(await thuTuc.Content.ReadAsStringAsync(Ct));
        Assert.Equal(408, jt.RootElement.GetArrayLength());
        Assert.All(jt.RootElement.EnumerateArray(), e => Assert.True(e.GetProperty("capXa").GetBoolean() || e.GetProperty("capTinh").GetBoolean()));
    }

    [Fact]
    public async Task HD04_NhapLaiBangCongCuNhap_ThemMotThuTucXa_TraThem_ETagDoi_IfNoneMatchCuKhong304()
    {
        db.CanCoDb();
        db.XoaHet();
        using var thuMuc = new ThuMucTam();
        var ban = new List<ThuTucNhap>
        {
            new("1.001193", "Thủ tục đăng ký khai sinh", "Hộ tịch", true, true),
            new("9.101", "Đăng ký khai sinh lưu động thử", "Hộ tịch", true, true),
            new("9.201", "Đăng ký thế chấp", "Đất đai", false, true, "Một phần"),
        };
        BoFileNhap.Tao(thuMuc.DuongDan, ban, ["1.001193", "9.101"]);
        var (ma1, _, loi1) = await BoFileNhap.NhapAsync(db.ChuoiKetNoi!, thuMuc.DuongDan);
        Assert.True(ma1 == 0, loi1);

        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();
        using var lan1 = await client.GetAsync(new Uri("/api/thu-tuc", UriKind.Relative), Ct);
        var etag1 = lan1.Headers.ETag;
        using var json1 = JsonDocument.Parse(await lan1.Content.ReadAsStringAsync(Ct));
        Assert.Equal(3, json1.RootElement.GetArrayLength());
        Assert.Equal(2, json1.RootElement.EnumerateArray().Count(e => e.GetProperty("capXa").GetBoolean()));
        Assert.NotNull(etag1);

        // Cùng ETag -> 304 (khi chưa nhập lại).
        using var yeuCau304 = new HttpRequestMessage(HttpMethod.Get, "/api/thu-tuc");
        yeuCau304.Headers.IfNoneMatch.Add(etag1);
        using var truoc = await client.SendAsync(yeuCau304, Ct);
        Assert.Equal(HttpStatusCode.NotModified, truoc.StatusCode);

        // Nhập lại, thêm 1 thủ tục xã. Không khởi động lại API.
        await Task.Delay(50, Ct);
        ban.Add(new ThuTucNhap("9.401", "Thủ tục thêm khi nhập lại", "Hộ tịch", true, false));
        File.Delete(Path.Combine(thuMuc.DuongDan, "thu-tuc.xlsx"));
        BoFileNhap.Tao(thuMuc.DuongDan, ban, ["1.001193", "9.101"]);
        var (ma2, _, loi2) = await BoFileNhap.NhapAsync(db.ChuoiKetNoi!, thuMuc.DuongDan);
        Assert.True(ma2 == 0, loi2);

        using var yeuCauCu = new HttpRequestMessage(HttpMethod.Get, "/api/thu-tuc");
        yeuCauCu.Headers.IfNoneMatch.Add(etag1);
        using var sau = await client.SendAsync(yeuCauCu, Ct);
        using var json2 = JsonDocument.Parse(await sau.Content.ReadAsStringAsync(Ct));

        Assert.Equal(HttpStatusCode.OK, sau.StatusCode);
        Assert.NotEqual(etag1, sau.Headers.ETag);
        Assert.Equal(4, json2.RootElement.GetArrayLength());
        Assert.Equal(3, json2.RootElement.EnumerateArray().Count(e => e.GetProperty("capXa").GetBoolean()));

        // Chi tiết cũng thấy ngay thủ tục mới (HD-06 của F03).
        using var chiTiet = await client.GetAsync(new Uri("/api/thu-tuc/9.401", UriKind.Relative), Ct);
        Assert.Equal(HttpStatusCode.OK, chiTiet.StatusCode);
        using var linhVuc = await client.GetAsync(new Uri("/api/linh-vuc", UriKind.Relative), Ct);
        using var jl = JsonDocument.Parse(await linhVuc.Content.ReadAsStringAsync(Ct));
        Assert.Equal(3, jl.RootElement.EnumerateArray().First(e => e.GetProperty("ma").GetString() == "ho-tich").GetProperty("soThuTucXa").GetInt32());
    }

    [Fact]
    public async Task F03_AC20_NhapBanDau16ThuongGap_Roi15_SoThuongGapVaThuTuDoiTheoDuLieu()
    {
        db.CanCoDb();
        db.XoaHet();
        using var thuMuc = new ThuMucTam();
        var ban = Enumerable.Range(1, 20)
            .Select(i => new ThuTucNhap($"9.{i:D3}", $"Thủ tục thử {i}", i <= 10 ? "Hộ tịch" : "Đất đai", true, true))
            .ToList();
        var mu16 = ban.Take(16).Select(t => t.Ma).ToList();
        BoFileNhap.Tao(thuMuc.DuongDan, ban, mu16);
        Assert.Equal(0, (await BoFileNhap.NhapAsync(db.ChuoiKetNoi!, thuMuc.DuongDan)).Ma);

        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();
        var thuongGap1 = await LayThuongGapAsync(client);
        Assert.Equal(mu16, thuongGap1);

        // Bỏ 1 dòng (mục thứ 14), nhập lại: 15; không khởi động lại.
        await Task.Delay(50, Ct);
        var mu15 = mu16.Where(m => m != mu16[13]).ToList();
        File.Delete(Path.Combine(thuMuc.DuongDan, "thu-tuc.xlsx"));
        BoFileNhap.Tao(thuMuc.DuongDan, ban, mu15);
        Assert.Equal(0, (await BoFileNhap.NhapAsync(db.ChuoiKetNoi!, thuMuc.DuongDan)).Ma);
        Assert.Equal(mu15, await LayThuongGapAsync(client));

        // Đổi thứ tự: mục cuối lên đầu (AC-22).
        await Task.Delay(50, Ct);
        var daoThuTu = new List<string> { mu15[^1] };
        daoThuTu.AddRange(mu15.Take(mu15.Count - 1));
        File.Delete(Path.Combine(thuMuc.DuongDan, "thu-tuc.xlsx"));
        BoFileNhap.Tao(thuMuc.DuongDan, ban, daoThuTu);
        Assert.Equal(0, (await BoFileNhap.NhapAsync(db.ChuoiKetNoi!, thuMuc.DuongDan)).Ma);
        Assert.Equal(daoThuTu, await LayThuongGapAsync(client));
    }

    private static async Task<List<string>> LayThuongGapAsync(HttpClient client)
    {
        using var r = await client.GetAsync(new Uri("/api/thu-tuc", UriKind.Relative), Ct);
        using var json = JsonDocument.Parse(await r.Content.ReadAsStringAsync(Ct));
        return
        [
            .. json.RootElement.EnumerateArray()
                .Where(e => e.GetProperty("thuTuThuongGap").ValueKind == JsonValueKind.Number)
                .OrderBy(e => e.GetProperty("thuTuThuongGap").GetInt32())
                .Select(e => e.GetProperty("ma").GetString()!),
        ];
    }

    [Fact]
    public async Task HD07_SauNhapLai_DuLieuMoiNgay_KhongChoHetHanCache()
    {
        db.CanCoDb();
        db.Nap(DoDac.DocFileNhung());
        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();
        using var truoc = await client.GetAsync(new Uri("/api/thu-tuc/1.001193", UriKind.Relative), Ct);
        var etagTruoc = truoc.Headers.ETag;

        // Sửa phí rồi nâng thời điểm nhập (như công cụ nhập).
        await using (var ghi = db.TaoDbContext())
        {
            await ghi.ThuTucs.Where(t => t.Ma == "1.001193").ExecuteUpdateAsync(s => s.SetProperty(t => t.Phi, "Lệ phí: PHI MOI"), Ct);
            await ghi.LanNhaps.Where(l => l.Loai == LanNhap.ThuTuc).ExecuteUpdateAsync(s => s.SetProperty(l => l.ThoiDiem, DateTimeOffset.UtcNow), Ct);
        }

        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, "/api/thu-tuc/1.001193");
        yeuCau.Headers.IfNoneMatch.Add(etagTruoc!);
        using var sau = await client.SendAsync(yeuCau, Ct);
        var than = await sau.Content.ReadAsStringAsync(Ct);

        Assert.Equal(HttpStatusCode.OK, sau.StatusCode);
        Assert.NotEqual(etagTruoc, sau.Headers.ETag);
        Assert.Contains("PHI MOI", than, StringComparison.Ordinal);
    }

    [Fact]
    public async Task HD10_SoLenhSql_TrungCacheToiDa1_LoCacheThuTuc1CongLinhVuc2()
    {
        db.CanCoDb();
        db.Nap(DoDac.DocFileNhung());
        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();

        factory.Sql.Xoa();
        using (var lo = await client.GetAsync(new Uri("/api/thu-tuc", UriKind.Relative), Ct))
        {
            Assert.Equal(HttpStatusCode.OK, lo.StatusCode);
        }

        var thuTucLo = factory.Sql.Lenh.Count;
        var cacLenhThuTuc = string.Join(" | ", factory.Sql.Lenh.Select(l => l.ReplaceLineEndings(" ")).Select(l => l[..Math.Min(l.Length, 160)]));
        var coThuTuc = factory.Sql.Lenh.Count(l => l.Contains("FROM thu_tuc", StringComparison.OrdinalIgnoreCase));
        factory.Sql.Xoa();
        using (var lo = await client.GetAsync(new Uri("/api/linh-vuc", UriKind.Relative), Ct))
        {
            Assert.Equal(HttpStatusCode.OK, lo.StatusCode);
        }

        var linhVucLo = factory.Sql.Lenh.Count;
        factory.Sql.Xoa();
        using (var trung = await client.GetAsync(new Uri("/api/thu-tuc", UriKind.Relative), Ct))
        {
            Assert.Equal(HttpStatusCode.OK, trung.StatusCode);
        }

        var trungCache = factory.Sql.Lenh.Count;
        DoDac.Ghi("F04 HD-10 so-lenh /api/thu-tuc lo-cache", [thuTucLo]);
        DoDac.Ghi("F04 HD-10 so-lenh /api/linh-vuc lo-cache", [linhVucLo]);
        DoDac.Ghi("F04 HD-10 so-lenh /api/thu-tuc trung-cache", [trungCache]);

        Assert.True(trungCache <= 1, $"trúng cache chạy {trungCache} lệnh SQL");
        Assert.Equal(1, coThuTuc);
        Assert.True(thuTucLo <= 2, $"/api/thu-tuc lỡ cache chạy {thuTucLo} lệnh (phiên bản + thủ tục): {cacLenhThuTuc}");
        Assert.True(linhVucLo <= 3, $"/api/linh-vuc lỡ cache chạy {linhVucLo} lệnh (phiên bản + 2 truy vấn)");
    }

    [Fact]
    public async Task HN09_P95_1000ThuTuc_TrungCache1000Lan_LoCache100Lan_VaLinhVuc()
    {
        db.CanCoDb();
        db.Nap(DoDac.DocFileNhung());
        // Mở rộng thành 1.000 thủ tục: nhân bản 592 thủ tục của bộ nhúng với mã mới.
        await using (var ghi = db.TaoDbContext())
        {
            var goc = DoDac.DocFileNhung().ThuTuc;
            var them = new List<ThuTuc>();
            for (var i = 0; i < 592; i++)
            {
                var banSao = JsonSerializer.Deserialize<ThuTuc>(JsonSerializer.Serialize(goc[i % goc.Count], Web), Web)!;
                banSao.Ma = $"G{i + 1:D6}";
                banSao.ThuTu = 408 + i + 1;
                banSao.ThuTuThuongGap = null;
                banSao.LinhVucMa = goc[i % goc.Count].LinhVucMa;
                them.Add(banSao);
            }

            ghi.ThuTucs.AddRange(them);
            await ghi.SaveChangesAsync(Ct);
            Assert.Equal(1000, await ghi.ThuTucs.CountAsync(Ct));
        }

        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();
        using (var lamNong = await client.GetAsync(new Uri("/api/thu-tuc", UriKind.Relative), Ct))
        {
            Assert.Equal(HttpStatusCode.OK, lamNong.StatusCode);
            DoDac.Ghi("F04 HN-09 kich-thuoc /api/thu-tuc 1000 muc (byte, khong nen)", [(await lamNong.Content.ReadAsByteArrayAsync(Ct)).Length]);
        }

        var trung = await DoDac.DoAsync(1000, async _ => await TaiAsync(client, "/api/thu-tuc"));
        DoDac.Ghi("F04 HN-09 /api/thu-tuc 1000 muc trung-cache x1000", trung);
        var linhVuc = await DoDac.DoAsync(1000, async _ => await TaiAsync(client, "/api/linh-vuc"));
        DoDac.Ghi("F04 HN-09 /api/linh-vuc 1000 muc x1000", linhVuc);

        var loCache = new List<double>();
        for (var i = 0; i < 100; i++)
        {
            await using (var ghi = db.TaoDbContext())
            {
                await ghi.LanNhaps.Where(l => l.Loai == LanNhap.ThuTuc).ExecuteUpdateAsync(s => s.SetProperty(l => l.ThoiDiem, DateTimeOffset.UtcNow.AddMinutes(i + 1)), Ct);
            }

            var dongHo = System.Diagnostics.Stopwatch.StartNew();
            await TaiAsync(client, "/api/thu-tuc");
            loCache.Add(dongHo.Elapsed.TotalMilliseconds);
        }

        DoDac.Ghi("F04 HN-09 /api/thu-tuc 1000 muc lo-cache x100 (moi lan doi phien ban)", loCache);

        Assert.True(DoDac.PhanVi(trung, 95) <= 300, $"p95 trúng cache = {DoDac.PhanVi(trung, 95):F1} ms");
        Assert.True(DoDac.PhanVi(linhVuc, 95) <= 300, $"p95 linh-vuc = {DoDac.PhanVi(linhVuc, 95):F1} ms");
        Assert.True(DoDac.PhanVi(loCache, 95) <= 300, $"p95 lỡ cache = {DoDac.PhanVi(loCache, 95):F1} ms");
    }

    private static async Task TaiAsync(HttpClient client, string duong)
    {
        using var r = await client.GetAsync(new Uri(duong, UriKind.Relative), Ct);
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        _ = await r.Content.ReadAsByteArrayAsync(Ct);
    }

    [Fact]
    public async Task BM19_PostgreSqlKhongToiDuoc_500LoiHeThong_KhongLoChuoiKetNoi()
    {
        await using var factory = new PostgreSqlApiFactory();
        using var client = factory.CreateHttpsClient();

        foreach (var duong in new[] { "/api/thu-tuc", "/api/linh-vuc" })
        {
            using var r = await client.GetAsync(new Uri(duong, UriKind.Relative), Ct);
            var than = await r.Content.ReadAsStringAsync(Ct);
            Assert.Equal(HttpStatusCode.InternalServerError, r.StatusCode);
            Assert.Contains("loi-he-thong", than, StringComparison.Ordinal);
            Assert.Contains("maTraCuu", than, StringComparison.Ordinal);
            Assert.DoesNotContain("BI-MAT-KET-NOI", than, StringComparison.Ordinal);
            Assert.DoesNotContain("khong-co-may-nay", than, StringComparison.Ordinal);
            Assert.DoesNotContain("   at ", than, StringComparison.Ordinal);
        }
    }
}

/// <summary>Thư mục tạm xoá khi giải phóng.</summary>
internal sealed class ThuMucTam : IDisposable
{
    public string DuongDan { get; } = Directory.CreateTempSubdirectory("dvc-tester-").FullName;

    public void Dispose()
    {
        try
        {
            Directory.Delete(DuongDan, recursive: true);
        }
        catch (IOException)
        {
            // Thư mục tạm: bỏ qua nếu bị khoá.
        }
    }
}
