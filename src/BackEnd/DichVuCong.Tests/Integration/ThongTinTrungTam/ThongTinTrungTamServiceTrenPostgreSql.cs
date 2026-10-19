using DichVuCong.Api.Features.ThongTinTrungTam;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using DichVuCong.Tests.Api;
using DichVuCong.Tests.Api.DuLieuThu;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Integration.ThongTinTrungTam;

/// <summary>
/// Lớp con PostgreSQL của test hợp đồng <see cref="ThongTinTrungTamServiceContract"/> (plan F00 §9.10, T31):
/// cùng các ca và kỳ vọng như nguồn Mẫu, chỉ khác nguồn là DB thật. Không có DB thử thì bỏ qua.
/// </summary>
public sealed class ThongTinTrungTamServiceTrenPostgreSql(DbThuNghiem db)
    : ThongTinTrungTamServiceContract, IClassFixture<DbThuNghiem>, IDisposable
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

/// <summary>Ca chỉ có ở PostgreSQL: chưa có dòng <c>lan_nhap</c> loại <c>thu-tuc</c> (nguồn Mẫu luôn có đủ 4 dòng).</summary>
public sealed class ThongTinTrungTamNgayCapNhatTrenPostgreSqlTests(DbThuNghiem db) : IClassFixture<DbThuNghiem>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task ChuaCoLanNhapThuTuc_NgayCapNhatThuTuc_LaNull_VaKhongLoi()
    {
        db.CanCoDb();
        // Có Trung tâm, không có dòng lan_nhap nào (DB mới nhập mỗi Trung tâm chưa nhập thủ tục).
        db.Nap(TrungTamThu.DayDu(), kemLanNhap: false);

        using var dichVu = db.TaoDichVu();
        using var scope = dichVu.CreateScope();
        var service = new ThongTinTrungTamService(scope.ServiceProvider.GetRequiredService<INguonDuLieu>());

        var dto = await service.LayAsync(Ct);
        var dacTa = await service.LayDacTaAsync(Ct);

        Assert.NotNull(dto);
        Assert.Null(dto.NgayCapNhatThuTuc);
        Assert.NotNull(dacTa);
        Assert.Null(dacTa.NgayCapNhatThuTuc);
        Assert.Equal("Trung tâm thử A", dacTa.Ten);
    }

    [Fact]
    public async Task CoLanNhapTrungTamNhungChuaCoThuTuc_NgayCapNhatThuTuc_VanLaNull()
    {
        db.CanCoDb();
        var tep = TrungTamThu.DayDu();
        db.Nap(tep, kemLanNhap: false);
        using (var ghi = db.TaoDbContext())
        {
            ghi.LanNhaps.Add(new DichVuCong.Data.Entities.LanNhap
            {
                Loai = DichVuCong.Data.Entities.LanNhap.TrungTam,
                ThoiDiem = TrungTamThu.ThoiDiem,
                TenFile = "trung-tam.xlsx",
            });
            await ghi.SaveChangesAsync(Ct);
        }

        using var dichVu = db.TaoDichVu();
        using var scope = dichVu.CreateScope();
        var service = new ThongTinTrungTamService(scope.ServiceProvider.GetRequiredService<INguonDuLieu>());

        Assert.Null((await service.LayAsync(Ct))!.NgayCapNhatThuTuc);
    }

    [Fact]
    public async Task LanNhapThuTuc_ThoiDiemUtc_DoiRaNgayVietNamDungTrenDbThat()
    {
        db.CanCoDb();
        db.Nap(TrungTamThu.DayDu());

        using var dichVu = db.TaoDichVu();
        using var scope = dichVu.CreateScope();
        var service = new ThongTinTrungTamService(scope.ServiceProvider.GetRequiredService<INguonDuLieu>());

        // 20:00 UTC ngày 12 là 03:00 ngày 13 giờ Việt Nam.
        Assert.Equal(new DateOnly(2026, 10, 13), (await service.LayAsync(Ct))!.NgayCapNhatThuTuc);
    }
}
