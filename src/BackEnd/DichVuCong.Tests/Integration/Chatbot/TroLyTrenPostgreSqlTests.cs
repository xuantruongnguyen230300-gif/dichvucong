using System.Diagnostics;
using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using ClosedXML.Excel;
using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Data;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Entities;
using DichVuCong.Data.Mau;
using DichVuCong.Import;
using DichVuCong.Tests.Api;
using DichVuCong.Tests.Api.Chatbot;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DichVuCong.Tests.Integration.Chatbot;

/// <summary>
/// Lớp con PostgreSQL của <see cref="TroLyServiceContract"/> (F06 T17): bộ 42 câu (và các ca ngoài bảng) chạy với dữ liệu nạp vào
/// DB thật qua <see cref="AppDbContext"/>. Không có DB thử thì bỏ qua.
/// </summary>
public sealed class TroLyServiceTrenPostgreSql(DbThuNghiem db) : TroLyServiceContract, IClassFixture<DbThuNghiem>, IDisposable
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

/// <summary>Tương đương hai nguồn: cùng dữ liệu, JSON đáp án giống hệt từng ca (F06 HD-01, HD-02, HD-03; plan Q3); đo thời gian dựng chỉ mục.</summary>
public sealed class TroLyHaiNguonTests(DbThuNghiem db) : IClassFixture<DbThuNghiem>
{
    private static readonly JsonSerializerOptions Web = new(JsonSerializerDefaults.Web);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static INguonDuLieu NguonMau(TepDuLieuMau tep, out IDisposable giu)
    {
        var services = new ServiceCollection();
        services.AddDichVuCongDataMau(tep);
        var goc = services.BuildServiceProvider();
        giu = goc;
        return goc.GetRequiredService<INguonDuLieu>();
    }

    public static TheoryData<int> CacCa() => TroLyServiceContract.CacCa();

    [Theory]
    [MemberData(nameof(CacCa))]
    public async Task BoThu_JsonDapAn_GiongHetTungByteGiuaNguonMauVaPostgreSql(int viTri)
    {
        db.CanCoDb();
        var ca = TroLyBang.Lay(viTri);

        using var hMau = TroLyHarness.Dung(NguonMau(TroLyBang.TaoDuLieu(ca.Du), out var giuMau));
        using var _ = giuMau;
        var cauMau = await hMau.HoiAsync(ca.Hoi, ca.NguCanh);

        db.Nap(TroLyBang.TaoDuLieu(ca.Du));
        using var dichVu = db.TaoDichVu();
        using var scope = dichVu.CreateScope();
        using var hPg = TroLyHarness.Dung(scope.ServiceProvider.GetRequiredService<INguonDuLieu>());
        var cauPg = await hPg.HoiAsync(ca.Hoi, ca.NguCanh);

        Assert.Equal(JsonSerializer.Serialize(cauMau, Web), JsonSerializer.Serialize(cauPg, Web));
        // Kho ghi: cùng nội dung đã che ở cả hai nguồn
        Assert.Equal(hMau.Kho.CacCau, hPg.Kho.CacCau);
    }

    [Fact]
    public async Task ChuDe_SauChipVaThuTuChuDeThu_JsonGiongHet()
    {
        db.CanCoDb();
        foreach (var (du, thuTu) in new[]
        {
            (DuLieuThu.Nen, 1), (DuLieuThu.Nen, 2), (DuLieuThu.Nen, 3), (DuLieuThu.Nen, 4), (DuLieuThu.Nen, 5), (DuLieuThu.Nen, 6),
            (DuLieuThu.ChuDeThu, TroLyThu.ThuTuChuDe15), (DuLieuThu.ChuDeThu, TroLyThu.ThuTuChuDe0), (DuLieuThu.PhanCong, 2),
        })
        {
            using var hMau = TroLyHarness.Dung(NguonMau(TroLyBang.TaoDuLieu(du), out var giuMau));
            using var _ = giuMau;
            db.Nap(TroLyBang.TaoDuLieu(du));
            using var dichVu = db.TaoDichVu();
            using var scope = dichVu.CreateScope();
            using var hPg = TroLyHarness.Dung(scope.ServiceProvider.GetRequiredService<INguonDuLieu>());

            var a = await hMau.Service.HoiChuDeAsync(thuTu, null, Ct);
            var b = await hPg.Service.HoiChuDeAsync(thuTu, null, Ct);

            Assert.Equal(JsonSerializer.Serialize(a, Web), JsonSerializer.Serialize(b, Web));
        }

        using var h1 = TroLyHarness.Dung(db.TaoDichVu().CreateScope().ServiceProvider.GetRequiredService<INguonDuLieu>());
        Assert.Equal(6, (await h1.Service.LayChuDeAsync(Ct)).Count);
    }

    [Fact]
    public async Task HN04_ThoiGianDungChiMucVaCauDauTien_408Va1000ThuTuc_HaiNguon()
    {
        db.CanCoDb();
        foreach (var (nhan, tep) in new (string, Func<TepDuLieuMau>)[] { ("408", TroLyThu.Nen), ("1000", () => TroLyThu.TaoLon(1000)) })
        {
            var nguonMau = NguonMau(tep(), out var giuMau);
            using var _ = giuMau;
            using var hMau = TroLyHarness.Dung(nguonMau);
            var dongHo = Stopwatch.StartNew();
            await hMau.HoiAsync("làm giấy khai sinh cần giấy tờ gì");
            var dungMau = dongHo.Elapsed.TotalMilliseconds;

            db.Nap(tep());
            using var dichVu = db.TaoDichVu();
            using var scope = dichVu.CreateScope();
            using var hPg = TroLyHarness.Dung(scope.ServiceProvider.GetRequiredService<INguonDuLieu>());
            dongHo.Restart();
            await hPg.HoiAsync("làm giấy khai sinh cần giấy tờ gì");
            var dungPg = dongHo.Elapsed.TotalMilliseconds;

            DoDac.Ghi($"F06 HN-04 cau-dau-tien+dung-chi-muc Mau {nhan} thu-tuc", [dungMau]);
            DoDac.Ghi($"F06 HN-04 cau-dau-tien+dung-chi-muc PostgreSql {nhan} thu-tuc", [dungPg]);
            Assert.True(dungMau < 5000 && dungPg < 5000, $"{nhan} thủ tục: dựng chỉ mục + câu đầu Mẫu {dungMau:F0} ms, PostgreSql {dungPg:F0} ms");
        }
    }
}

/// <summary>Ghi thật vào PostgreSQL qua HTTP, che thông tin cá nhân, xuất Excel, giới hạn đầu vào, trần kho (F06 AC-8/14/16/27, BR-7/8/12, KH, CN, GH, BM).</summary>
public sealed class TroLyHttpTrenPostgreSqlTests(DbThuNghiem db) : IClassFixture<DbThuNghiem>
{
    private static readonly JsonSerializerOptions Web = new(JsonSerializerDefaults.Web);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static Task<HttpResponseMessage> HoiAsync(HttpClient client, string cau, string? ma = null) =>
        client.PostAsJsonAsync(new Uri("/api/tro-ly/hoi", UriKind.Relative), new { cauHoi = cau, maThuTuc = ma }, Web, Ct);

    private async Task<List<CauChuaTraLoi>> DongTrongKhoAsync()
    {
        await using var doc = db.TaoDbContext();
        return await doc.CauChuaTraLois.AsNoTracking().OrderBy(c => c.NoiDung).ToListAsync(Ct);
    }

    private static async Task<(string Loai, string Thanh)> DocLoaiAsync(HttpResponseMessage r)
    {
        var thanh = await r.Content.ReadAsStringAsync(Ct);
        using var json = JsonDocument.Parse(thanh);
        return (json.RootElement.GetProperty("loai").GetString()!, thanh);
    }

    [Fact]
    public async Task AC8_AC16_AC14_GhiThat_CheSoDienThoaiCccdEmail_GopHaiLan()
    {
        db.CanCoDb();
        db.Nap(TroLyThu.Nen());
        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();

        using (var r = await HoiAsync(client, "số 0912345678 của tôi nộp hồ sơ chưa"))
        {
            var (loai, thanh) = await DocLoaiAsync(r);
            Assert.Equal("khong-hieu", loai);
            Assert.DoesNotContain("0912345678", thanh, StringComparison.Ordinal);
            Assert.DoesNotContain("09******78", thanh, StringComparison.Ordinal);
        }

        using (var r = await HoiAsync(client, "CCCD 079123456789, email nguyenvana@gmail.com, hồ sơ của tôi đâu"))
        {
            Assert.Equal("khong-hieu", (await DocLoaiAsync(r)).Loai);
        }

        using (await HoiAsync(client, "giá vàng hôm nay"))
        {
        }

        using (await HoiAsync(client, "Giá  VÀNG hôm nay"))
        {
        }

        var dong = await DongTrongKhoAsync();
        Assert.Equal(3, dong.Count);
        var tho = string.Join("\n", dong.Select(d => d.NoiDung));
        Assert.Contains("số 09******78 của tôi nộp hồ sơ chưa", tho, StringComparison.Ordinal);
        Assert.Contains("07********89", tho, StringComparison.Ordinal);
        Assert.Contains("n***@gmail.com", tho, StringComparison.Ordinal);
        foreach (var goc in new[] { "0912345678", "079123456789", "nguyenvana" })
        {
            Assert.DoesNotContain(goc, tho, StringComparison.Ordinal);
        }

        var vang = dong.Single(d => d.NoiDung.Contains("vàng", StringComparison.OrdinalIgnoreCase));
        Assert.Equal(2, vang.SoLanGap);
    }

    [Fact]
    public async Task CN_BienTheCheQuaApi_NoiDungLuuKhongConSoGocVaEmailGoc()
    {
        db.CanCoDb();
        db.Nap(TroLyThu.Nen());
        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();

        // (câu, chuỗi gốc không được còn trong kho)
        var canChe = new (string Cau, string Goc)[]
        {
            ("giá vàng 0912.345.678", "345.678"),
            ("giá vàng 0912 345 678", "345 678"),
            ("giá vàng +84 912 345 678", "912 345 678"),
            ("giá vàng 0912-345-678", "345-678"),
            ("giá vàng (028) 3822 1234", "3822 1234"),
            ("giá vàng 09 12 34 56 78", "34 56 78"),
            ("giá vàng 09-12-34-56-78", "34-56-78"),
            ("giá vàng Số: 0912345678.", "0912345678"),
            ("giá vàng liên hệ 0912345678, 0987654321 nhé", "0987654321"),
            ("giá vàng Email: Nguyen.Van.A+tag@Gmail.COM xin", "Nguyen.Van.A"),
            ("giá vàng a@b.vn", "a@b.vn"),
            ("giá vàng cccd 079123456789", "079123456789"),
            ("giá vàng cmnd 025123456", "025123456"),
        };
        foreach (var (cau, _) in canChe)
        {
            using var r = await HoiAsync(client, cau);
            Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        }

        var tho = string.Join("\n", (await DongTrongKhoAsync()).Select(d => d.NoiDung));
        var conSot = canChe.Where(c => tho.Contains(c.Goc, StringComparison.Ordinal)).Select(c => c.Cau).ToList();
        Assert.True(conSot.Count == 0, "Còn dữ liệu cá nhân chưa che trong kho: " + string.Join(" | ", conSot));
    }

    [Fact]
    public async Task CN_KhongCheNhamMaThuTucNgayThangVaSo8ChuSo()
    {
        db.CanCoDb();
        db.Nap(TroLyThu.Nen());
        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();

        foreach (var cau in new[] { "giá vàng 12 05", "giá vàng 12345678", "giá vàng 12/05" })
        {
            using var r = await HoiAsync(client, cau);
            Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        }

        var noiDung = (await DongTrongKhoAsync()).Select(d => d.NoiDung).ToList();
        Assert.Contains("giá vàng 12 05", noiDung);
        Assert.Contains("giá vàng 12/05", noiDung);
        Assert.Contains("giá vàng 12345678", noiDung);
    }

    [Fact]
    public async Task Xuat_FileExcelKhongConDuLieuCaNhan_VaKhongCoCongThuc()
    {
        db.CanCoDb();
        db.Nap(TroLyThu.Nen());
        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();

        var doc = new[]
        {
            "số 0912345678 của tôi nộp hồ sơ chưa",
            "giá vàng =HYPERLINK(\"http://evil.test/x\",\"bấm vào\")",
            "=HYPERLINK(\"http://evil.test/x\",\"bấm vào\")",
            "+cmd|' /C calc'!A0",
            "@SUM(1+1)",
            "-2+3 giá vàng",
            "<script>alert(1)</script> giá vàng",
            "'; DROP TABLE cau_chua_tra_loi;-- giá vàng",
        };
        foreach (var cau in doc)
        {
            using var r = await HoiAsync(client, cau);
            Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        }

        var duongDan = Path.Combine(Path.GetTempPath(), $"dvc-xuat-{Guid.NewGuid():N}.xlsx");
        try
        {
            var cauHinh = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?> { [UngDung.KhoaChuoiKetNoi] = db.ChuoiKetNoi })
                .Build();
            var services = new ServiceCollection();
            services.AddSingleton<IConfiguration>(cauHinh);
            services.AddDichVuCongData(db.ChuoiKetNoi!);
            services.AddSingleton(TimeProvider.System);
            using var dichVu = services.BuildServiceProvider();
            using var ra = new StringWriter(CultureInfo.InvariantCulture);
            using var loi = new StringWriter(CultureInfo.InvariantCulture);

            var ma = await UngDung.ChayAsync(["xuat", "cau-chua-tra-loi", duongDan], dichVu, ra, loi, Ct);
            Assert.True(ma == 0, loi.ToString());

            using var sach = new XLWorkbook(duongDan);
            var sheet = sach.Worksheet(1);
            var cacO = sheet.RangeUsed()!.Cells().ToList();
            var tho = new StringBuilder();
            foreach (var o in cacO)
            {
                Assert.False(o.HasFormula, $"{o.Address}: ô có công thức: {o.FormulaA1}");
                if (o.DataType == XLDataType.Text)
                {
                    tho.AppendLine(o.GetString());
                }
            }

            var noiDung = tho.ToString();
            Assert.DoesNotContain("0912345678", noiDung, StringComparison.Ordinal);
            Assert.Contains("09******78", noiDung, StringComparison.Ordinal);
            // Mọi ô dạng "=…", "+…", "@…", "-…" vẫn là chuỗi chữ, không phải công thức (ClosedXML đọc DataType = Text, HasFormula = false)
            var ocNguyHiem = cacO.Where(o => o.GetString() is { Length: > 0 } s && "=+-@".Contains(s[0], StringComparison.Ordinal)).ToList();
            Assert.NotEmpty(ocNguyHiem);
            Assert.All(ocNguyHiem, o => Assert.Equal(XLDataType.Text, o.DataType));
            Assert.All(ocNguyHiem, o => Assert.False(o.HasFormula));
        }
        finally
        {
            File.Delete(duongDan);
        }
    }

    [Fact]
    public async Task GH_501KyTu_400_KhongGhiKho_Body64KbTro_413_JsonHong400_KhongPhaiJson415()
    {
        db.CanCoDb();
        db.Nap(TroLyThu.Nen());
        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();

        using (var r = await HoiAsync(client, new string('a', 501)))
        {
            Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
            var thanh = await r.Content.ReadAsStringAsync(Ct);
            Assert.Contains("du-lieu-khong-hop-le", thanh, StringComparison.Ordinal);
            Assert.DoesNotContain("aaaaaaaaaa", thanh, StringComparison.Ordinal);
        }

        using (var r = await HoiAsync(client, new string('x', 500)))
        {
            Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        }

        using (var r = await client.PostAsync(
            new Uri("/api/tro-ly/hoi", UriKind.Relative),
            new StringContent("{\"cauHoi\":\"" + new string('b', 70_000) + "\"}", Encoding.UTF8, "application/json"), Ct))
        {
            Assert.Equal(HttpStatusCode.RequestEntityTooLarge, r.StatusCode);
            Assert.Contains("yeu-cau-qua-lon", await r.Content.ReadAsStringAsync(Ct), StringComparison.Ordinal);
        }

        using (var r = await client.PostAsync(new Uri("/api/tro-ly/hoi", UriKind.Relative), new StringContent("{khong phai json", Encoding.UTF8, "application/json"), Ct))
        {
            Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
        }

        using (var r = await client.PostAsync(new Uri("/api/tro-ly/hoi", UriKind.Relative), new StringContent("cauHoi=khai+sinh", Encoding.UTF8, "application/x-www-form-urlencoded"), Ct))
        {
            Assert.Equal(HttpStatusCode.UnsupportedMediaType, r.StatusCode);
        }

        // Phương thức sai: PUT -> 405. GET trên đường chỉ nhận POST hiện trả 404 `khong-tim-thay` (route dự phòng của SPA nhận GET) — ghi nhận ở test.md.
        using (var r = await client.PutAsync(new Uri("/api/tro-ly/hoi", UriKind.Relative), new StringContent("{}", Encoding.UTF8, "application/json"), Ct))
        {
            Assert.Equal(HttpStatusCode.MethodNotAllowed, r.StatusCode);
        }

        using (var r = await client.GetAsync(new Uri("/api/tro-ly/hoi?cauHoi=khai+sinh", UriKind.Relative), Ct))
        {
            Assert.True(r.StatusCode is HttpStatusCode.MethodNotAllowed or HttpStatusCode.NotFound, r.StatusCode.ToString());
        }

        var dong = await DongTrongKhoAsync();
        Assert.DoesNotContain(dong, d => d.NoiDung.StartsWith("aaaa", StringComparison.Ordinal));
        Assert.DoesNotContain(dong, d => d.NoiDung.Contains("bbbb", StringComparison.Ordinal));
    }

    [Fact]
    public async Task BM_ChuoiDaiNhieuNhomSo_ReDoS_MoiCauDuoi300Ms_VaKhong5xx()
    {
        db.CanCoDb();
        db.Nap(TroLyThu.Nen());
        await using var factory = new PostgreSqlThatApiFactory(db.ChuoiKetNoi!);
        using var client = factory.CreateHttpsClient();

        var cacCau = new List<(string Nhan, string Cau)>
        {
            ("125 nhóm số 1 chữ số", string.Join(' ', Enumerable.Repeat('1', 250))),
            ("nhóm 2 chữ số", string.Join(' ', Enumerable.Repeat("12", 160))),
            ("nhóm 3 chữ số cách chấm", string.Join('.', Enumerable.Repeat("123", 120))),
            ("số liền 499", new string('9', 499)),
            ("0912 lặp", string.Concat(Enumerable.Repeat("0912 ", 99))),
            ("a@ lặp", string.Concat(Enumerable.Repeat("a@", 250))),
            ("a@a.a@a.a lặp", string.Concat(Enumerable.Repeat("a@a.", 125))),
            ("dấu ngăn xen kẽ", string.Concat(Enumerable.Repeat("1 .", 166))),
            ("ngoặc và gạch", string.Concat(Enumerable.Repeat("(1)-", 125))),
            ("dấu chấm 500", new string('.', 500)),
            ("khoảng trắng + số", new string(' ', 250) + new string('7', 250)),
            ("từ lạ 500 ký tự (sửa lỗi gõ)", string.Join(' ', Enumerable.Range(0, 70).Select(i => $"zq{i:D3}x"))),
        };
        var sb = new StringBuilder();
        foreach (var (nhan, cau) in cacCau)
        {
            Assert.True(cau.Length <= 500, nhan);
            var dongHo = Stopwatch.StartNew();
            using var r = await HoiAsync(client, cau);
            var ms = dongHo.Elapsed.TotalMilliseconds;
            sb.Append(CultureInfo.InvariantCulture, $"{nhan}: {r.StatusCode} {ms:F0} ms; ");
            Assert.True((int)r.StatusCode < 500, $"{nhan}: {r.StatusCode}");
            Assert.True(ms < 300, $"{nhan}: {ms:F0} ms (≥ 300 ms)");
        }

        DoDac.Ghi("F06 BM-11 ReDoS 12 chuoi dai: " + sb, [0]);
    }

    [Fact]
    public async Task AC27_HaiMuoiNgay_Giu89Ngay_Xoa91Ngay_GapLaiTinhLai90Ngay_TrenDbThat()
    {
        db.CanCoDb();
        db.XoaHet();
        var batDau = new DateTimeOffset(2026, 10, 13, 8, 0, 0, TimeSpan.Zero);
        var dongHo = new DongHoGia(batDau);
        await using var ctx = db.TaoDbContext();
        var kho = new KhoCauChuaTraLoiPostgreSql(ctx, dongHo);

        await kho.GhiAsync("xem bói", Ct);
        await kho.GhiAsync("giá vàng hôm nay", Ct);

        // +80 ngày: "giá vàng hôm nay" gặp lại -> lần cuối dời tới +80
        dongHo.TienToi(TimeSpan.FromDays(80));
        await kho.GhiAsync("giá vàng hôm nay", Ct);

        // +91 ngày so với lần ghi đầu: "xem bói" (lần cuối tại 0) quá 90 ngày -> xoá; "giá vàng" (lần cuối +80) còn
        dongHo.TienToi(TimeSpan.FromDays(11));
        var daXoa = await kho.XoaQuaHanAsync(dongHo.GetUtcNow().AddDays(-90), Ct);
        Assert.Equal(1, daXoa);
        var con = await DongTrongKhoAsync();
        Assert.Equal(["giá vàng hôm nay"], con.Select(d => d.NoiDung));
        Assert.Equal(2, con[0].SoLanGap);

        // +89 ngày tính từ lần gặp cuối (+80 -> +169): vẫn còn; +171: xoá
        dongHo.TienToi(TimeSpan.FromDays(78));
        Assert.Equal(0, await kho.XoaQuaHanAsync(dongHo.GetUtcNow().AddDays(-90), Ct));
        dongHo.TienToi(TimeSpan.FromDays(3));
        Assert.Equal(1, await kho.XoaQuaHanAsync(dongHo.GetUtcNow().AddDays(-90), Ct));
        Assert.Empty(await DongTrongKhoAsync());
    }

    [Fact]
    public async Task KhoDay_TranMacDinh50000_CauMoiBiBo_CauCoSanVanCong_CanhBaoMotLanMoiGio()
    {
        db.CanCoDb();
        db.XoaHet();
        await using (var ghi = db.TaoDbContext())
        {
            // 50.000 dòng giả bằng một câu SQL (tham số hoá, không có dữ liệu ngoài)
            await ghi.Database.ExecuteSqlAsync(
                $"""
                INSERT INTO cau_chua_tra_loi (noi_dung, khoa_gop, so_lan_gap, lan_gap_cuoi)
                SELECT 'rac ' || g, 'rac ' || g, 1, {DateTimeOffset.UtcNow}
                FROM generate_series(1, {KhoCauChuaTraLoiOptions.SoDongMacDinh}) AS g
                """,
                Ct);
        }

        var dongHo = new DongHoGia(DateTimeOffset.UtcNow);
        var logger = new BoGhiLog(typeof(KhoCauChuaTraLoiPostgreSql).FullName!);
        using var nhaMay = LoggerFactory.Create(b => b.AddProvider(logger).SetMinimumLevel(LogLevel.Trace));
        var canhBao = new CanhBaoKhoDay(dongHo, nhaMay.CreateLogger<KhoCauChuaTraLoiPostgreSql>());
        await using var ctx = db.TaoDbContext();
        var kho = new KhoCauChuaTraLoiPostgreSql(ctx, dongHo, Options.Create(new KhoCauChuaTraLoiOptions()), canhBao);

        await kho.GhiAsync("câu thật mới khi kho đầy", Ct);
        await kho.GhiAsync("câu thật mới khi kho đầy lần hai", Ct);
        await kho.GhiAsync("rac 7", Ct);

        await using var doc = db.TaoDbContext();
        Assert.Equal(KhoCauChuaTraLoiOptions.SoDongMacDinh, await doc.CauChuaTraLois.CountAsync(Ct));
        Assert.False(await doc.CauChuaTraLois.AnyAsync(c => EF.Functions.Like(c.NoiDung, "câu thật%"), Ct));
        Assert.Equal(2, (await doc.CauChuaTraLois.SingleAsync(c => c.KhoaGop == "rac 7", Ct)).SoLanGap);

        var canh = await logger.DocAsync();
        Assert.Equal(LogLevel.Warning, canh.MucDo);
        Assert.Contains("50000", canh.NoiDung.Replace(".", string.Empty, StringComparison.Ordinal).Replace(",", string.Empty, StringComparison.Ordinal), StringComparison.Ordinal);
        Assert.False(logger.ConDongChuaDoc, "Cảnh báo kho đầy phải chỉ một dòng trong cùng một giờ.");

        dongHo.TienToi(TimeSpan.FromMinutes(61));
        await kho.GhiAsync("câu thật mới sau một giờ", Ct);
        Assert.Equal(LogLevel.Warning, (await logger.DocAsync()).MucDo);
    }

    [Fact]
    public async Task BM_LogYeuCauKhongChuaNoiDungCauHoiHayDuLieuCaNhan()
    {
        db.CanCoDb();
        db.Nap(TroLyThu.Nen());
        var thu = new List<string>();
        var ghi = new GhiTatCaLog(thu);
        await using var factory = new PostgreSqlGhiLogFactory(db.ChuoiKetNoi!, ghi);
        using var client = factory.CreateHttpsClient();

        using (await HoiAsync(client, "CCCD 079123456789 email nguyenvana@gmail.com số 0912345678 giá vàng bí mật xyz")) { }
        using (await HoiAsync(client, new string('q', 501))) { }
        using (await client.PostAsync(new Uri("/api/tro-ly/hoi", UriKind.Relative), new StringContent("{\"cauHoi\":\"" + new string('b', 70_000) + "\"}", Encoding.UTF8, "application/json"), Ct)) { }
        await Task.Delay(300, Ct);

        string[] cam = ["079123456789", "nguyenvana", "0912345678", "09******78", "bí mật xyz", "qqqqqqqq", "bbbbbbbb"];
        foreach (var c in cam)
        {
            Assert.DoesNotContain(thu, dong => dong.Contains(c, StringComparison.Ordinal));
        }
    }

    private sealed class PostgreSqlGhiLogFactory(string chuoiKetNoi, ILoggerProvider ghi) : ApiFactory
    {
        protected override string? NguonDuLieu => "PostgreSql";

        protected override string? ChuoiKetNoi => chuoiKetNoi;

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            base.ConfigureWebHost(builder);
            builder.ConfigureLogging(l => l.AddProvider(ghi).SetMinimumLevel(LogLevel.Trace));
        }
    }

    private sealed class GhiTatCaLog(List<string> dong) : ILoggerProvider
    {
        public ILogger CreateLogger(string categoryName) => new Bo(dong);

        public void Dispose()
        {
        }

        private sealed class Bo(List<string> dong) : ILogger
        {
            public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

            public bool IsEnabled(LogLevel logLevel) => true;

            public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
            {
                lock (dong)
                {
                    dong.Add(formatter(state, exception) + (exception?.ToString() ?? string.Empty));
                }
            }
        }
    }
}
