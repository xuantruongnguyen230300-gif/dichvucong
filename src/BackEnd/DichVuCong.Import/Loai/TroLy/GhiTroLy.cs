using DichVuCong.Data;
using DichVuCong.Data.Entities;
using DichVuCong.Import.Resources;
using Microsoft.EntityFrameworkCore;

namespace DichVuCong.Import.Loai.TroLy;

internal static class GhiTroLy
{
    public static async Task GhiAsync(
        AppDbContext db,
        DuLieuTroLy duLieu,
        string duongDanFile,
        TimeProvider thoiGian,
        CancellationToken huy)
    {
        // cau_hoi_mau_cach_hoi bị xoá theo (ON DELETE CASCADE).
        await db.CauHoiMaus.ExecuteDeleteAsync(huy);
        await db.ChuDeGoiYs.ExecuteDeleteAsync(huy);
        await db.TuDongNghias.ExecuteDeleteAsync(huy);
        await db.VietTats.ExecuteDeleteAsync(huy);

        db.CauHoiMaus.AddRange(duLieu.CauHoiMau);
        db.ChuDeGoiYs.AddRange(duLieu.ChuDeGoiY);
        db.TuDongNghias.AddRange(duLieu.TuDongNghia);
        db.VietTats.AddRange(duLieu.VietTat);
        await db.SaveChangesAsync(huy);
        db.ChangeTracker.Clear();

        await GhiChung.GhiLanNhapAsync(db, LanNhap.TroLy, duongDanFile, thoiGian, huy);
    }

    public static IEnumerable<string> TomTat(DuLieuTroLy d)
    {
        yield return Chuoi.Dinh(
            ThongBao.TomTatTroLy,
            d.CauHoiMau.Count,
            d.CauTheoMuc,
            d.ChuDeGoiY.Count,
            d.TuDongNghia.Count,
            d.VietTat.Count);
    }
}
