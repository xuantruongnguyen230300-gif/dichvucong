using DichVuCong.Data;
using DichVuCong.Data.Entities;
using DichVuCong.Import.Resources;
using Microsoft.EntityFrameworkCore;

namespace DichVuCong.Import.Loai.PhanCong;

internal static class GhiPhanCong
{
    public static async Task GhiAsync(
        AppDbContext db,
        DuLieuPhanCong duLieu,
        string duongDanFile,
        TimeProvider thoiGian,
        CancellationToken huy)
    {
        await db.PhanCongLinhVucs.ExecuteDeleteAsync(huy);
        await db.NhanSus.ExecuteDeleteAsync(huy);

        db.PhanCongLinhVucs.AddRange(duLieu.PhanCong);
        db.NhanSus.AddRange(duLieu.NhanSu);
        await db.SaveChangesAsync(huy);
        db.ChangeTracker.Clear();

        await GhiChung.GhiLanNhapAsync(db, LanNhap.PhanCong, duongDanFile, thoiGian, huy);
    }

    public static IEnumerable<string> TomTat(DuLieuPhanCong d)
    {
        yield return Chuoi.Dinh(ThongBao.TomTatPhanCong, d.PhanCong.Count, d.NhanSu.Count);
    }
}
