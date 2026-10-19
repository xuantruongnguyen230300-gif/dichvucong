using DichVuCong.Data;
using DichVuCong.Data.Entities;
using DichVuCong.Import.Resources;
using Microsoft.EntityFrameworkCore;

namespace DichVuCong.Import.Loai.TrungTam;

internal static class GhiTrungTam
{
    public static async Task GhiAsync(
        AppDbContext db,
        DuLieuTrungTam duLieu,
        string duongDanFile,
        TimeProvider thoiGian,
        CancellationToken huy)
    {
        await db.TrungTams.ExecuteDeleteAsync(huy);
        await db.GioLamViecs.ExecuteDeleteAsync(huy);
        await db.LienKets.ExecuteDeleteAsync(huy);
        await db.ODichVus.ExecuteDeleteAsync(huy);

        duLieu.TrungTam.Id = Data.Entities.TrungTam.IdDuyNhat;
        db.TrungTams.Add(duLieu.TrungTam);
        db.GioLamViecs.AddRange(duLieu.GioLamViec);
        db.LienKets.AddRange(duLieu.LienKet);
        db.ODichVus.AddRange(duLieu.ODichVu);
        await db.SaveChangesAsync(huy);
        db.ChangeTracker.Clear();

        await GhiChung.GhiLanNhapAsync(db, LanNhap.TrungTam, duongDanFile, thoiGian, huy);
    }

    public static IEnumerable<string> TomTat(DuLieuTrungTam d)
    {
        yield return Chuoi.Dinh(ThongBao.TomTatTrungTam, 1, d.GioLamViec.Count, d.LienKet.Count, d.ODichVu.Count);
    }
}
