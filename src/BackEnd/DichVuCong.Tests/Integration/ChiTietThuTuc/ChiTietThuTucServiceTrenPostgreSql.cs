using System.Net;
using System.Text.Json;
using DichVuCong.Api.Features.ChiTietThuTuc;
using DichVuCong.Data;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using DichVuCong.Tests.Api;
using DichVuCong.Tests.Api.DuLieuThu;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Integration.ChiTietThuTuc;

/// <summary>
/// Lớp con PostgreSQL của test hợp đồng <see cref="ChiTietThuTucServiceContract"/> (plan F00 §9.10, T31; F03 T10, ca HD-02…HD-05):
/// cùng các ca và kỳ vọng như nguồn Mẫu, chỉ khác nguồn là DB thật. Không có DB thử thì bỏ qua.
/// </summary>
public sealed class ChiTietThuTucServiceTrenPostgreSql(DbThuNghiem db)
    : ChiTietThuTucServiceContract, IClassFixture<DbThuNghiem>, IDisposable
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

/// <summary>
/// Tương đương hai nguồn và đo trên DB thật cho <c>GET /api/thu-tuc/{ma}</c> (F03 HD-01, HD-03, BM-03, BM-24, HN-08, HN-09).
/// </summary>
public sealed class ChiTietThuTucTuongDuongPostgreSqlTests(DbThuNghiem db) : IClassFixture<DbThuNghiem>
{
    private static readonly JsonSerializerOptions Web = new(JsonSerializerDefaults.Web);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static ChiTietThuTucService DichVuMau(out ServiceProvider goc)
    {
        var services = new ServiceCollection();
        services.AddDichVuCongDataMau(DoDac.DocFileNhung());
        goc = services.BuildServiceProvider();
        return new ChiTietThuTucService(goc.GetRequiredService<INguonDuLieu>());
    }

    [Fact]
    public async Task HD01_408Ma_NguonMauVaPostgreSql_CungJsonTungByte()
    {
        db.CanCoDb();
        db.Nap(DoDac.DocFileNhung());
        var danhSachMa = TepDuLieuMau.Nhung.ThuTuc.Select(t => t.Ma).ToList();
        Assert.Equal(408, danhSachMa.Count);

        var mau = DichVuMau(out var gocMau);
        using var dichVu = db.TaoDichVu();
        using var scope = dichVu.CreateScope();
        using var _ = gocMau;
        var pg = new ChiTietThuTucService(scope.ServiceProvider.GetRequiredService<INguonDuLieu>());

        var khacNhau = new List<string>();
        foreach (var ma in danhSachMa)
        {
            var a = JsonSerializer.Serialize(await mau.LayAsync(ma, Ct), Web);
            var b = JsonSerializer.Serialize(await pg.LayAsync(ma, Ct), Web);
            Assert.NotEqual("null", a);
            if (a != b)
            {
                khacNhau.Add(ma);
            }
        }

        Assert.True(khacNhau.Count == 0, $"{khacNhau.Count}/408 mã có JSON khác nhau giữa hai nguồn, ví dụ: {string.Join(", ", khacNhau.Take(5))}");
    }

    [Fact]
    public async Task HD03_Jsonb_ThuTuPhanTuGiuNguyen_VaKhongLoiDichTruyVan()
    {
        db.CanCoDb();
        db.Nap(ThuTucThu.Bo());

        using var dichVu = db.TaoDichVu();
        using var scope = dichVu.CreateScope();
        var pg = new ChiTietThuTucService(scope.ServiceProvider.GetRequiredService<INguonDuLieu>());

        var dto = await pg.LayAsync(ThuTucThu.MaDayDu, Ct);

        Assert.NotNull(dto);
        Assert.Equal(["Giấy tờ Z", "Giấy tờ M", "Giấy tờ A"], dto.ThanhPhanHoSo.Select(g => g.Ten));
        Assert.Equal(["Trường hợp B", "Trường hợp A"], dto.TrinhTu.Where(b => b.TruongHop is not null).Select(b => b.TruongHop));
        Assert.Equal(["Kết quả Z", "Kết quả A"], dto.KetQua);
        Assert.Equal(["Trực tuyến", "Bưu chính", "Trực tiếp"], dto.HinhThucNop);

        // Thủ tục lớn nhất của bộ nhúng: số phần tử các mảng jsonb khớp với tệp nguồn.
        db.Nap(DoDac.DocFileNhung());
        var lon = TepDuLieuMau.Nhung.ThuTuc.OrderByDescending(t => t.TrinhTu.Sum(b => b.NoiDung.Length) + t.ThanhPhanHoSo.Count * 50).First();
        using var dv2 = db.TaoDichVu();
        using var scope2 = dv2.CreateScope();
        var pg2 = new ChiTietThuTucService(scope2.ServiceProvider.GetRequiredService<INguonDuLieu>());
        var dtoLon = await pg2.LayAsync(lon.Ma, Ct);
        Assert.NotNull(dtoLon);
        Assert.Equal(lon.TrinhTu.Count, dtoLon.TrinhTu.Count);
        Assert.Equal(lon.ThanhPhanHoSo.Select(g => g.Ten), dtoLon.ThanhPhanHoSo.Select(g => g.Ten));
        Assert.Equal(lon.CanCu.Count, dtoLon.CanCu.Count);
        Assert.Equal(lon.CachThuc.Count, dtoLon.CachThuc.Count);
    }

    [Fact]
    public async Task Http_HD01_TatCa408Ma_VaHaiDanhMuc_HaiNguonCungThanTungByte()
    {
        db.CanCoDb();
        db.Nap(DoDac.DocFileNhung());
        await using var fMau = new MauApiFactoryDo();
        await using var fPg = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var cMau = fMau.CreateHttpsClient();
        using var cPg = fPg.CreateHttpsClient();

        var duong = new List<string> { "/api/thu-tuc", "/api/linh-vuc" };
        duong.AddRange(TepDuLieuMau.Nhung.ThuTuc.Select(t => "/api/thu-tuc/" + Uri.EscapeDataString(t.Ma)));

        var khac = new List<string>();
        foreach (var d in duong)
        {
            using var a = await cMau.GetAsync(new Uri(d, UriKind.Relative), Ct);
            using var b = await cPg.GetAsync(new Uri(d, UriKind.Relative), Ct);
            Assert.Equal(HttpStatusCode.OK, a.StatusCode);
            Assert.Equal(HttpStatusCode.OK, b.StatusCode);
            var ta = await a.Content.ReadAsByteArrayAsync(Ct);
            var tb = await b.Content.ReadAsByteArrayAsync(Ct);
            if (!ta.AsSpan().SequenceEqual(tb))
            {
                khac.Add(d);
            }
        }

        Assert.True(khac.Count == 0, $"{khac.Count}/{duong.Count} đường dẫn có thân khác nhau: {string.Join(", ", khac.Take(5))}");
    }

    [Theory]
    [InlineData("' OR '1'='1")]
    [InlineData("1.001193' --")]
    [InlineData("1.001193;DROP TABLE thu_tuc;--")]
    [InlineData("1.001193%27")]
    [InlineData("%27%20UNION%20SELECT%201")]
    [InlineData("<script>alert(1)</script>")]
    [InlineData("..%2f..%2fetc%2fpasswd")]
    [InlineData("1234567890123456789012")]
    public async Task BM03_MaSaiDinhDang_404_KhongLenhSql_BangNguyenVen(string ma)
    {
        db.CanCoDb();
        db.Nap(DoDac.DocFileNhung());
        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();
        // Khởi động host (phiên bản dữ liệu chạy 1 truy vấn cho mỗi yêu cầu dùng cache); xoá lệnh đã ghi.
        using (var ok = await client.GetAsync(new Uri("/api/thu-tuc/1.001193", UriKind.Relative), Ct))
        {
            Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        }

        factory.Sql.Xoa();
        using var phanHoi = await client.GetAsync(new Uri("/api/thu-tuc/" + ma, UriKind.Relative), Ct);

        Assert.Equal(HttpStatusCode.NotFound, phanHoi.StatusCode);
        var than = await phanHoi.Content.ReadAsStringAsync(Ct);
        Assert.DoesNotContain("UNION", than, StringComparison.Ordinal);
        Assert.DoesNotContain("DROP", than, StringComparison.Ordinal);
        Assert.DoesNotContain("<script>", than, StringComparison.Ordinal);
        // Mã sai định dạng không được sinh truy vấn thủ tục nào (chỉ được phép truy vấn phiên bản dữ liệu).
        Assert.DoesNotContain(factory.Sql.Lenh, l => l.Contains("thu_tuc", StringComparison.OrdinalIgnoreCase));

        await using var dbCtx = db.TaoDbContext();
        Assert.Equal(408, await dbCtx.ThuTucs.CountAsync(Ct));
        using var lai = await client.GetAsync(new Uri("/api/thu-tuc/1.001193", UriKind.Relative), Ct);
        Assert.Equal(HttpStatusCode.OK, lai.StatusCode);
    }

    [Fact]
    public async Task BM24_ThuTucKhongThuocDanhMucNao_DbTuChoi_NenChiTietKhongTungLoThuTucNgoaiDanhMuc()
    {
        db.CanCoDb();
        var tep = DoDac.DocFileNhung();
        tep.ThuTuc[0].ThuocDanhMucXa = false;
        tep.ThuTuc[0].ThuocDanhMucTinh = false;

        // Ràng buộc ck_thu_tuc_danh_muc: mỗi thủ tục phải thuộc ít nhất một cấp -> tình huống "P-G" không thể tồn tại ở PostgreSQL.
        var loi = Assert.Throws<DbUpdateException>(() => db.Nap(tep));

        Assert.Contains("ck_thu_tuc_danh_muc", loi.InnerException?.Message ?? string.Empty, StringComparison.Ordinal);
        await Task.CompletedTask;
    }

    [Fact]
    public async Task HN08_P95_ChiTiet_LoCache_VaTrungCache_TrenPostgreSql()
    {
        db.CanCoDb();
        db.Nap(DoDac.DocFileNhung());
        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();
        var ma = new[] { "1.013229", "1.001193" };
        // Làm nóng: khởi động host, biên dịch truy vấn.
        foreach (var m in ma)
        {
            using var _ = await client.GetAsync(new Uri("/api/thu-tuc/" + m, UriKind.Relative), Ct);
        }

        foreach (var m in ma)
        {
            // Lỡ cache: query khác nhau không đổi khoá cache (query bị bỏ) -> dùng service trực tiếp để luôn chạm DB.
            using var dichVu = db.TaoDichVu();
            using var scope = dichVu.CreateScope();
            var service = new ChiTietThuTucService(scope.ServiceProvider.GetRequiredService<INguonDuLieu>());
            var lo = await DoDac.DoAsync(100, async _ => Assert.NotNull(await service.LayAsync(m, Ct)));
            DoDac.Ghi($"HN-08 chi-tiet {m} lo-cache (service+PostgreSQL)", lo);
            Assert.True(DoDac.PhanVi(lo, 95) <= 300, $"p95 lỡ cache {m} = {DoDac.PhanVi(lo, 95):F1} ms");

            // Trúng cache (HTTP trong tiến trình, output cache).
            var trung = await DoDac.DoAsync(100, async _ =>
            {
                using var r = await client.GetAsync(new Uri("/api/thu-tuc/" + m, UriKind.Relative), Ct);
                Assert.Equal(HttpStatusCode.OK, r.StatusCode);
                Assert.NotEmpty(await r.Content.ReadAsByteArrayAsync(Ct));
            });
            DoDac.Ghi($"HN-08 chi-tiet {m} trung-cache (HTTP in-proc)", trung);
            Assert.True(DoDac.PhanVi(trung, 95) <= 300, $"p95 trúng cache {m} = {DoDac.PhanVi(trung, 95):F1} ms");
        }
    }

    [Fact]
    public async Task HN09_SoLenhSql_TrungCache_TrungHon1_LoCache_ToiDa3()
    {
        db.CanCoDb();
        db.Nap(DoDac.DocFileNhung());
        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();

        factory.Sql.Xoa();
        using (var lo = await client.GetAsync(new Uri("/api/thu-tuc/1.001193", UriKind.Relative), Ct))
        {
            Assert.Equal(HttpStatusCode.OK, lo.StatusCode);
        }

        // Bỏ lệnh dọn câu chưa trả lời: việc nền chạy lúc khởi động host, không thuộc yêu cầu.
        var soLenhLo = factory.Sql.Lenh.Count(l => !l.Contains("cau_chua_tra_loi", StringComparison.Ordinal));
        DoDac.Ghi("HN-09 lenh-lo-cache: " + string.Join(" || ", factory.Sql.Lenh.Where(l => !l.Contains("cau_chua_tra_loi", StringComparison.Ordinal)).Select(l => l.ReplaceLineEndings(" "))), [soLenhLo]);
        DoDac.Ghi("HN-09 so-lenh-sql lo-cache", [soLenhLo]);

        factory.Sql.Xoa();
        using (var trung = await client.GetAsync(new Uri("/api/thu-tuc/1.001193", UriKind.Relative), Ct))
        {
            Assert.Equal(HttpStatusCode.OK, trung.StatusCode);
        }

        var soLenhTrung = factory.Sql.Lenh.Count;
        DoDac.Ghi("HN-09 so-lenh-sql trung-cache", [soLenhTrung]);

        // Kế hoạch: trúng cache tối đa 1 truy vấn (phiên bản dữ liệu); lỡ cache: phiên bản + thủ tục + tên lĩnh vực = 3.
        Assert.True(soLenhTrung <= 1, $"trúng cache chạy {soLenhTrung} lệnh SQL: {string.Join(" | ", factory.Sql.Lenh)}");
        Assert.True(soLenhLo <= 3, $"lỡ cache chạy {soLenhLo} lệnh SQL");
    }

    [Fact]
    public async Task HD10_PostgreSqlKhongToiDuoc_500LoiHeThong_ThanKhongLoChuoiKetNoi()
    {
        await using var factory = new PostgreSqlApiFactory();
        using var client = factory.CreateHttpsClient();

        using var phanHoi = await client.GetAsync(new Uri("/api/thu-tuc/1.001193", UriKind.Relative), Ct);
        var than = await phanHoi.Content.ReadAsStringAsync(Ct);

        Assert.Equal(HttpStatusCode.InternalServerError, phanHoi.StatusCode);
        Assert.Contains("loi-he-thong", than, StringComparison.Ordinal);
        Assert.DoesNotContain("BI-MAT-KET-NOI", than, StringComparison.Ordinal);
        Assert.DoesNotContain("khong-co-may-nay", than, StringComparison.Ordinal);
        Assert.DoesNotContain("   at ", than, StringComparison.Ordinal);
        Assert.False(phanHoi.Headers.Contains("Server"));

        // Nguồn Mẫu không phụ thuộc DB.
        await using var mau = new MauApiFactoryDo();
        using var cm = mau.CreateHttpsClient();
        using var ok = await cm.GetAsync(new Uri("/api/thu-tuc/1.001193", UriKind.Relative), Ct);
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
    }
}
