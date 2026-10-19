using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using DichVuCong.Data;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Integration.DuLieu;

/// <summary>
/// Tương đương dữ liệu hai nguồn (plan F00 §9.10, T31): nạp nội dung file nhúng vào DB riêng bằng <see cref="AppDbContext"/>,
/// rồi với từng tập trong 14 tập đọc qua <see cref="NguonDuLieuPostgreSql"/> và <see cref="NguonDuLieuMau"/> bằng cùng một phép
/// <c>Select</c> (R2) và sắp theo khoá (trong bộ nhớ, R3) → JSON → phải giống nhau.
/// </summary>
public sealed class TuongDuongDuLieuTests(DbThuNghiem db) : IClassFixture<DbThuNghiem>
{
    private static readonly JsonSerializerOptions Json = new()
    {
        Converters = { new JsonStringEnumConverter() },
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static TepDuLieuMau DocFileNhung() => TepDuLieuMau.DocTaiNguyen(typeof(TepDuLieuMau).Assembly, TepDuLieuMau.TenTaiNguyen);

    /// <summary>Đọc một tập: phép Select giống nhau cho hai nguồn, sắp theo khoá trong bộ nhớ (chuỗi theo Ordinal), rồi sang JSON.</summary>
    private static async Task<(string Json, int So)> DocTapAsync<T, TKetQua, TKhoa>(
        IQueryable<T> nguon,
        System.Linq.Expressions.Expression<Func<T, TKetQua>> chon,
        Func<TKetQua, TKhoa> khoa)
    {
        var danhSach = await nguon.Select(chon).DanhSachAsync(Ct);
        var daSap = typeof(TKhoa) == typeof(string)
            ? danhSach.OrderBy(khoa, (IComparer<TKhoa>)StringComparer.Ordinal).ToList()
            : danhSach.OrderBy(khoa).ToList();
        return (JsonSerializer.Serialize(daSap, Json), daSap.Count);
    }

    private delegate Task<(string Json, int So)> DocTap(INguonDuLieu nguon);

    public static TheoryData<string> TenCacTap =>
    [
        "ThuTucs", "LinhVucs", "PhanCongLinhVucs", "NhanSus", "TrungTams", "GioLamViecs", "LienKets",
        "ODichVus", "CauHoiMaus", "CauHoiMauCachHois", "ChuDeGoiYs", "TuDongNghias", "VietTats", "LanNhaps",
    ];

    private static readonly Dictionary<string, DocTap> CacTap = new()
    {
        ["ThuTucs"] = n => DocTapAsync(n.ThuTucs, x => x, x => x.Ma),
        ["LinhVucs"] = n => DocTapAsync(n.LinhVucs, x => x, x => x.Ma),
        ["PhanCongLinhVucs"] = n => DocTapAsync(n.PhanCongLinhVucs, x => x, x => x.LinhVucMa),
        ["NhanSus"] = n => DocTapAsync(n.NhanSus, x => x, x => x.ThuTu),
        ["TrungTams"] = n => DocTapAsync(n.TrungTams, x => x, x => x.Id),
        ["GioLamViecs"] = n => DocTapAsync(n.GioLamViecs, x => x, x => x.Thu),
        ["LienKets"] = n => DocTapAsync(n.LienKets, x => x, x => x.ThuTu),
        ["ODichVus"] = n => DocTapAsync(n.ODichVus, x => x, x => x.ThuTu),
        // CachHoi nằm trong entity: EF không nạp, nguồn Mẫu thì có sẵn -> bỏ ra khỏi phép Select (R2).
        ["CauHoiMaus"] = n => DocTapAsync(n.CauHoiMaus, x => new { x.ThuTu, x.CauHoi, x.TraLoi, x.MucTrungTam, x.MaThuTuc }, x => x.ThuTu),
        ["CauHoiMauCachHois"] = n => DocTapAsync(
            n.CauHoiMauCachHois,
            x => new { x.CauHoiMauThuTu, x.ThuTu, x.NoiDung, x.NoiDungTimKiem },
            x => x.CauHoiMauThuTu * 1000L + x.ThuTu),
        ["ChuDeGoiYs"] = n => DocTapAsync(n.ChuDeGoiYs, x => x, x => x.ThuTu),
        ["TuDongNghias"] = n => DocTapAsync(n.TuDongNghias, x => x, x => x.ThuTu),
        ["VietTats"] = n => DocTapAsync(n.VietTats, x => x, x => x.ThuTu),
        ["LanNhaps"] = n => DocTapAsync(n.LanNhaps, x => new { x.Loai, ThoiDiemUtc = x.ThoiDiem.UtcTicks, x.TenFile }, x => x.Loai),
    };

    [Fact]
    public void CoDayDu14Tap()
    {
        Assert.Equal(14, CacTap.Count);
        Assert.Equal(CacTap.Keys.Order(StringComparer.Ordinal), TenCacTap.Select(d => d.Data).Order(StringComparer.Ordinal));
    }

    [Theory]
    [MemberData(nameof(TenCacTap))]
    public async Task MoiTap_DocQuaPostgreSqlVaQuaMau_GiongNhau(string ten)
    {
        db.CanCoDb();
        var tepMau = DocFileNhung();
        // Bản đọc riêng cho DB: EF gán khoá, nối navigation vào đối tượng của nó.
        db.Nap(DocFileNhung());

        var dichVuMau = new ServiceCollection().AddDichVuCongDataMau(tepMau).BuildServiceProvider();
        await using var _ = dichVuMau;
        using var dichVuPg = db.TaoDichVu();
        using var scope = dichVuPg.CreateScope();

        var nguonMau = dichVuMau.GetRequiredService<INguonDuLieu>();
        var nguonPg = scope.ServiceProvider.GetRequiredService<INguonDuLieu>();
        Assert.IsType<NguonDuLieuMau>(nguonMau);
        Assert.IsType<NguonDuLieuPostgreSql>(nguonPg);

        var (jsonMau, soMau) = await CacTap[ten](nguonMau);
        var (jsonPg, soPg) = await CacTap[ten](nguonPg);

        Assert.Equal(soMau, soPg);
        Assert.Equal(jsonMau, jsonPg);
    }

    [Fact]
    public async Task SoBanGhi_DungVoiFileNhung()
    {
        db.CanCoDb();
        db.Nap(DocFileNhung());
        var tep = DocFileNhung();

        using var dichVu = db.TaoDichVu();
        using var scope = dichVu.CreateScope();
        var pg = scope.ServiceProvider.GetRequiredService<INguonDuLieu>();

        Assert.Equal(tep.ThuTuc.Count, await pg.ThuTucs.DemAsync(Ct));
        Assert.Equal(tep.LinhVuc.Count, await pg.LinhVucs.DemAsync(Ct));
        Assert.Equal(tep.CauHoiMauCachHoi.Count, await pg.CauHoiMauCachHois.DemAsync(Ct));
        Assert.Equal(4, await pg.LanNhaps.DemAsync(Ct));
        Assert.Equal(408, await pg.ThuTucs.DemAsync(Ct));
        Assert.Equal(75, await pg.LinhVucs.DemAsync(Ct));
        Assert.Equal(16, await pg.ThuTucs.Where(t => t.ThuTuThuongGap != null).DemAsync(Ct));
        Assert.Equal(tep.ThoiDiem, await pg.LanNhaps.LonNhatAsync(l => (DateTimeOffset?)l.ThoiDiem, Ct));
    }
}
