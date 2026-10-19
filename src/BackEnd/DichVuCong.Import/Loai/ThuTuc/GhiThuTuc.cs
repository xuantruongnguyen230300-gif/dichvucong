using DichVuCong.Data;
using DichVuCong.Data.Entities;
using DichVuCong.Import.Resources;
using Microsoft.EntityFrameworkCore;

namespace DichVuCong.Import.Loai.ThuTuc;

internal static class GhiThuTuc
{
    /// <summary>Thay toàn bộ <c>thu_tuc</c> và <c>linh_vuc</c> (kèm thứ tự thường gặp), ghi <c>lan_nhap</c>. Gọi trong transaction.</summary>
    public static async Task GhiAsync(
        AppDbContext db,
        DuLieuThuTuc duLieu,
        string duongDanFile,
        TimeProvider thoiGian,
        CancellationToken huy)
    {
        // DELETE (không TRUNCATE): API vẫn đọc bản cũ tới lúc commit.
        await db.ThuTucs.ExecuteDeleteAsync(huy);
        await db.LinhVucs.ExecuteDeleteAsync(huy);

        db.LinhVucs.AddRange(duLieu.LinhVuc);
        db.ThuTucs.AddRange(duLieu.ThuTuc);
        await db.SaveChangesAsync(huy);
        db.ChangeTracker.Clear();

        await GhiChung.GhiLanNhapAsync(db, LanNhap.ThuTuc, duongDanFile, thoiGian, huy);
    }

    public static IEnumerable<string> TomTat(DuLieuThuTuc d)
    {
        yield return Chuoi.Dinh(ThongBao.TomTatThuTuc, d.ThuTuc.Count, d.CapXa, d.CapTinh);
        yield return Chuoi.Dinh(ThongBao.TomTatLinhVucThuongGap, d.LinhVuc.Count, d.ThuongGap);
    }
}
