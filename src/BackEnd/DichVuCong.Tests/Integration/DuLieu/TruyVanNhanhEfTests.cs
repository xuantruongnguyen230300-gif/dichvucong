using DichVuCong.Data.DuLieu;
using DichVuCong.Data;
using DichVuCong.Data.Mau;
using DichVuCong.Tests.Api.DuLieuThu;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Integration.DuLieu;

/// <summary>
/// 5 hàm <see cref="TruyVan"/> trên nhánh EF (nguồn PostgreSql, DB thật), đối chiếu với nhánh bộ nhớ (nguồn Mẫu) cùng dữ liệu.
/// Nhánh Mẫu đã có test ở <c>Tests/Data/DuLieu/</c>; ở đây chứng minh hai nhánh cho cùng kết quả (plan F00 §9.1, §9.4).
/// </summary>
public sealed class TruyVanNhanhEfTests(DbThuNghiem db) : IClassFixture<DbThuNghiem>, IDisposable
{
    private readonly List<IDisposable> _canGiaiPhong = [];

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private INguonDuLieu NguonPostgreSql(TepDuLieuMau tep)
    {
        db.CanCoDb();
        db.Nap(tep);
        var dichVu = db.TaoDichVu();
        var scope = dichVu.CreateScope();
        _canGiaiPhong.Add(scope);
        _canGiaiPhong.Add(dichVu);
        return scope.ServiceProvider.GetRequiredService<INguonDuLieu>();
    }

    private static INguonDuLieu NguonMau(TepDuLieuMau tep)
    {
        var services = new ServiceCollection();
        services.AddDichVuCongDataMau(tep);
        var dichVu = services.BuildServiceProvider();
        return dichVu.GetRequiredService<INguonDuLieu>();
    }

    public void Dispose()
    {
        foreach (var doiTuong in _canGiaiPhong)
        {
            doiTuong.Dispose();
        }
    }

    [Fact]
    public void NguonPostgreSql_DungProviderCuaEf_NguonMau_Khong()
    {
        var pg = NguonPostgreSql(TrungTamThu.DayDu());
        var mau = NguonMau(TrungTamThu.DayDu());

        Assert.IsAssignableFrom<Microsoft.EntityFrameworkCore.Query.IAsyncQueryProvider>(pg.GioLamViecs.Provider);
        Assert.False(mau.GioLamViecs.Provider is Microsoft.EntityFrameworkCore.Query.IAsyncQueryProvider);
    }

    [Fact]
    public async Task DanhSachAsync_Ef_SapTheoKhoaSo_DungThuTu_VaGiongNguonMau()
    {
        var pg = NguonPostgreSql(TrungTamThu.DayDu());
        var mau = NguonMau(TrungTamThu.DayDu());

        var tuPg = await pg.GioLamViecs.OrderBy(g => g.Thu).Select(g => new { g.Thu, g.SangTu, g.ChieuDen }).DanhSachAsync(Ct);
        var tuMau = await mau.GioLamViecs.OrderBy(g => g.Thu).Select(g => new { g.Thu, g.SangTu, g.ChieuDen }).DanhSachAsync(Ct);

        Assert.Equal([1, 3, 6], tuPg.Select(g => g.Thu));
        Assert.Equal(tuMau, tuPg);
    }

    [Fact]
    public async Task DanhSachAsync_Ef_TapRong_TraDanhSachRong()
    {
        var pg = NguonPostgreSql(TrungTamThu.ToiThieu());

        Assert.Empty(await pg.GioLamViecs.OrderBy(g => g.Thu).DanhSachAsync(Ct));
        Assert.Empty(await pg.NhanSus.DanhSachAsync(Ct));
    }

    [Fact]
    public async Task DauTienAsync_Ef_CoVaKhongCo_GiongNguonMau()
    {
        var pg = NguonPostgreSql(TrungTamThu.DayDu());
        var mau = NguonMau(TrungTamThu.DayDu());

        var tenPg = await pg.LienKets.OrderBy(l => l.ThuTu).Select(l => l.Ten).DauTienAsync(Ct);
        var tenMau = await mau.LienKets.OrderBy(l => l.ThuTu).Select(l => l.Ten).DauTienAsync(Ct);

        Assert.Equal("Cổng Dịch vụ công Quốc gia", tenPg);
        Assert.Equal(tenMau, tenPg);
        Assert.Null(await pg.LienKets.Where(l => l.ThuTu == 99).Select(l => l.Ten).DauTienAsync(Ct));
        Assert.Null(await pg.LienKets.Where(l => l.ThuTu == 99).DauTienAsync(Ct));
    }

    [Fact]
    public async Task DemAsync_Ef_GiongNguonMau_KeCaLocVaTapRong()
    {
        var pg = NguonPostgreSql(TrungTamThu.DayDu());
        var mau = NguonMau(TrungTamThu.DayDu());

        Assert.Equal(3, await pg.GioLamViecs.DemAsync(Ct));
        Assert.Equal(await mau.GioLamViecs.DemAsync(Ct), await pg.GioLamViecs.DemAsync(Ct));
        Assert.Equal(2, await pg.GioLamViecs.Where(g => g.SangTu != null).DemAsync(Ct));
        Assert.Equal(0, await pg.NhanSus.DemAsync(Ct));
        Assert.Equal(4, await pg.LanNhaps.DemAsync(Ct));
    }

    [Fact]
    public async Task CoAsync_Ef_GiongNguonMau()
    {
        var pg = NguonPostgreSql(TrungTamThu.DayDu());
        var mau = NguonMau(TrungTamThu.DayDu());

        Assert.True(await pg.TrungTams.CoAsync(Ct));
        Assert.Equal(await mau.TrungTams.CoAsync(Ct), await pg.TrungTams.CoAsync(Ct));
        Assert.False(await pg.NhanSus.CoAsync(Ct));
        Assert.False(await pg.GioLamViecs.Where(g => g.Thu == 7).CoAsync(Ct));
        Assert.True(await pg.GioLamViecs.Where(g => g.Thu == 6).CoAsync(Ct));
    }

    [Fact]
    public async Task LonNhatAsync_Ef_GiaTriNullableVaTapRong_GiongNguonMau()
    {
        var pg = NguonPostgreSql(TrungTamThu.DayDu());
        var mau = NguonMau(TrungTamThu.DayDu());

        var lonNhatPg = await pg.LanNhaps.LonNhatAsync(l => (DateTimeOffset?)l.ThoiDiem, Ct);
        var lonNhatMau = await mau.LanNhaps.LonNhatAsync(l => (DateTimeOffset?)l.ThoiDiem, Ct);
        Assert.Equal(TrungTamThu.ThoiDiem, lonNhatPg);
        Assert.Equal(lonNhatMau, lonNhatPg);

        // Tập rỗng với kiểu cho null: null ở cả hai nhánh (chưa nhập lần nào -> phiên bản 0).
        db.Nap(TrungTamThu.ChuaCoTrungTam(), kemLanNhap: false);
        Assert.Null(await pg.LanNhaps.LonNhatAsync(l => (DateTimeOffset?)l.ThoiDiem, Ct));
        Assert.Null(await NguonMau(new TepDuLieuMau()).TrungTams.LonNhatAsync(t => (int?)t.Id, Ct));
    }

    [Fact]
    public async Task LonNhatAsync_Ef_TapRongKieuKhongChoNull_NemInvalidOperation_NhuNhanhBoNho()
    {
        var pg = NguonPostgreSql(TrungTamThu.ToiThieu());

        await Assert.ThrowsAsync<InvalidOperationException>(() => pg.GioLamViecs.LonNhatAsync(g => g.Thu, Ct));
        await Assert.ThrowsAsync<InvalidOperationException>(() => NguonMau(TrungTamThu.ToiThieu()).GioLamViecs.LonNhatAsync(g => g.Thu, Ct));
    }

    [Fact]
    public async Task Ef_TokenDaHuy_NemOperationCanceled()
    {
        var pg = NguonPostgreSql(TrungTamThu.DayDu());
        using var huy = new CancellationTokenSource();
        await huy.CancelAsync();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => pg.GioLamViecs.DanhSachAsync(huy.Token));
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => pg.GioLamViecs.DemAsync(huy.Token));
    }

    [Fact]
    public async Task Ef_LocTheoChuoiDaChuanHoa_VaKyTuDacBiet_KhongLoiSql()
    {
        var tep = TrungTamThu.DayDu();
        var pg = NguonPostgreSql(tep);

        // Chuỗi người dùng đi vào biểu thức LINQ: EF phải tham số hoá, không hỏng khi có dấu nháy, % _ và thẻ HTML.
        foreach (var chuoi in new[] { "x'); DROP TABLE lien_ket;--", "100%", "_", "<script>alert(1)</script>", new string('a', 5000) })
        {
            Assert.Equal(0, await pg.LienKets.Where(l => l.Ten.Contains(chuoi)).DemAsync(Ct));
        }

        Assert.Equal(2, await pg.LienKets.DemAsync(Ct));
    }
}
