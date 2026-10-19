using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using DichVuCong.Tests.Api;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Integration.PhienBanDuLieu;

/// <summary>
/// Lớp con PostgreSQL của test hợp đồng <see cref="PhienBanDuLieuContract"/>: cùng các ca và kỳ vọng như nguồn Mẫu,
/// chỉ khác nguồn là DB thật. Không có DB thử thì bỏ qua.
/// </summary>
public sealed class PhienBanDuLieuTrenPostgreSql(DbThuNghiem db)
    : PhienBanDuLieuContract, IClassFixture<DbThuNghiem>, IDisposable
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
