using DichVuCong.Data;
using DichVuCong.Import.Excel;
using DichVuCong.Import.Loai;
using DichVuCong.Import.Loai.PhanCong;
using DichVuCong.Import.Loai.ThuTuc;
using DichVuCong.Import.Loai.TroLy;
using DichVuCong.Import.Loai.TrungTam;
using DichVuCong.Import.Resources;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace DichVuCong.Import.Lenh;

/// <summary>Lệnh <c>nhap</c>: đọc, kiểm toàn bộ file, rồi mới ghi trong một transaction (plan F01 §5.1, §5.2).</summary>
internal static class NhapDuLieu
{
    private sealed record DanhMuc(HashSet<string> MaThuTuc, HashSet<string> MaLinhVuc);

    private sealed class LoiCoSoDuLieuException(string thongBao) : Exception(thongBao);

    public static async Task<int> ChayAsync(
        LenhNhap lenh,
        IServiceProvider dichVu,
        TextWriter ra,
        TextWriter loi,
        CancellationToken huy)
    {
        var thoiGian = dichVu.GetService<TimeProvider>() ?? TimeProvider.System;

        List<MucNhap> cacMuc;
        try
        {
            cacMuc = lenh.Loai == LoaiNhap.TatCa
                ? DocTatCa(lenh.DuongDan)
                : [await DocMotAsync(lenh.Loai, lenh.DuongDan, dichVu, huy)];
        }
        catch (LoiFileException e)
        {
            await loi.WriteLineAsync(e.Message);
            return (int)MaThoat.SaiLenh;
        }
        catch (LoiCoSoDuLieuException e)
        {
            await loi.WriteLineAsync(e.Message);
            return (int)MaThoat.LoiHeThong;
        }

        // BR-2: có lỗi ở bất kỳ file nào thì không ghi gì.
        var coLoi = cacMuc.Where(m => !m.HopLe).ToList();
        if (coLoi.Count > 0)
        {
            foreach (var muc in coLoi)
            {
                await InLoiAsync(muc, loi);
            }

            if (cacMuc.Count > 1)
            {
                await loi.WriteLineAsync(ThongBao.KetQuaKhongNhapTatCa);
            }

            return (int)MaThoat.FileCoLoi;
        }

        if (lenh.ChiKiem)
        {
            foreach (var muc in cacMuc)
            {
                await ra.WriteLineAsync(Chuoi.Dinh(ThongBao.KetQuaHopLe, muc.TenFile));
                await InKetQuaAsync(muc, ra);
            }

            return (int)MaThoat.ThanhCong;
        }

        var maThoat = await GhiChung.TrongGiaoDichAsync(
            dichVu,
            loi,
            async (db, ct) =>
            {
                foreach (var muc in cacMuc)
                {
                    await muc.GhiAsync(db, thoiGian, ct);
                }
            },
            huy);

        if (maThoat != (int)MaThoat.ThanhCong)
        {
            return maThoat;
        }

        foreach (var muc in cacMuc)
        {
            await ra.WriteLineAsync(Chuoi.Dinh(ThongBao.KetQuaDaNhap, muc.TenFile));
            await InKetQuaAsync(muc, ra);
        }

        return (int)MaThoat.ThanhCong;
    }

    private static async Task<MucNhap> DocMotAsync(LoaiNhap loai, string duongDan, IServiceProvider dichVu, CancellationToken huy)
    {
        switch (loai)
        {
            case LoaiNhap.ThuTuc:
                return DocThuTuc(duongDan);
            case LoaiNhap.PhanCong:
                DocExcel.KiemTraDuongDan(duongDan);
                var danhMuc = await LayDanhMucAsync(dichVu, batBuoc: false, huy);
                return DocPhanCong(duongDan, danhMuc?.MaLinhVuc);
            case LoaiNhap.TrungTam:
                return DocTrungTam(duongDan);
            case LoaiNhap.TroLy:
                DocExcel.KiemTraDuongDan(duongDan);
                var dm = await LayDanhMucAsync(dichVu, batBuoc: true, huy);
                return DocTroLy(duongDan, dm?.MaThuTuc, dm?.MaLinhVuc);
            default:
                throw new ArgumentOutOfRangeException(nameof(loai));
        }
    }

    internal static List<MucNhap> DocTatCa(string thuMuc)
    {
        if (!Directory.Exists(thuMuc))
        {
            throw new LoiFileException(Chuoi.Dinh(ThongBao.LoiThuMucKhongTim, thuMuc));
        }

        // Đủ 4 file mới đọc, để thiếu file thì báo ngay, không đọc dở.
        foreach (var mau in MauExcel.TatCa)
        {
            if (!File.Exists(Path.Combine(thuMuc, mau.TenFile)))
            {
                throw new LoiFileException(Chuoi.Dinh(ThongBao.LoiThieuFileTrongThuMuc, thuMuc, mau.TenFile));
            }
        }

        var thuTuc = DocThuTuc(Path.Combine(thuMuc, MauExcel.TenFileThuTuc));
        var duLieuThuTuc = ((MucNhap<DuLieuThuTuc>)thuTuc).DuLieu;

        // Đối chiếu với file thủ tục cùng lần chạy, không với DB. File thủ tục hỏng cấu trúc thì bỏ qua đối chiếu.
        var doiChieuDuoc = !thuTuc.Loi.Any(l => l.Dong is null);
        var maThuTuc = doiChieuDuoc ? duLieuThuTuc.MaThuTuc : null;
        var maLinhVuc = doiChieuDuoc ? duLieuThuTuc.MaLinhVuc : null;

        return
        [
            thuTuc,
            DocPhanCong(Path.Combine(thuMuc, MauExcel.TenFilePhanCong), maLinhVuc),
            DocTrungTam(Path.Combine(thuMuc, MauExcel.TenFileTrungTam)),
            DocTroLy(Path.Combine(thuMuc, MauExcel.TenFileTroLy), maThuTuc, maLinhVuc),
        ];
    }

    private static MucNhap<DuLieuThuTuc> DocThuTuc(string duongDan)
    {
        using var sach = DocExcel.Mo(duongDan);
        var file = DocExcel.Doc(sach, MauExcel.ThuTuc, Path.GetFileName(duongDan));
        return new MucNhap<DuLieuThuTuc>(duongDan, KiemTraThuTuc.KiemTra(file), GhiThuTuc.TomTat, GhiThuTuc.GhiAsync);
    }

    private static MucNhap<DuLieuPhanCong> DocPhanCong(string duongDan, ISet<string>? maLinhVuc)
    {
        using var sach = DocExcel.Mo(duongDan);
        var file = DocExcel.Doc(sach, MauExcel.PhanCong, Path.GetFileName(duongDan));
        return new MucNhap<DuLieuPhanCong>(duongDan, KiemTraPhanCong.KiemTra(file, maLinhVuc), GhiPhanCong.TomTat, GhiPhanCong.GhiAsync);
    }

    private static MucNhap<DuLieuTrungTam> DocTrungTam(string duongDan)
    {
        using var sach = DocExcel.Mo(duongDan);
        var file = DocExcel.Doc(sach, MauExcel.TrungTam, Path.GetFileName(duongDan));
        return new MucNhap<DuLieuTrungTam>(duongDan, KiemTraTrungTam.KiemTra(file), GhiTrungTam.TomTat, GhiTrungTam.GhiAsync);
    }

    private static MucNhap<DuLieuTroLy> DocTroLy(string duongDan, ISet<string>? maThuTuc, ISet<string>? maLinhVuc)
    {
        using var sach = DocExcel.Mo(duongDan);
        var file = DocExcel.Doc(sach, MauExcel.TroLy, Path.GetFileName(duongDan));
        return new MucNhap<DuLieuTroLy>(duongDan, KiemTraTroLy.KiemTra(file, maThuTuc, maLinhVuc), GhiTroLy.TomTat, GhiTroLy.GhiAsync);
    }

    /// <summary>
    /// Mã thủ tục, mã lĩnh vực đang có trong DB để đối chiếu khi nhập một loại riêng.
    /// <paramref name="batBuoc"/> false (phân công): không có DB hoặc lỗi DB thì trả null, bỏ qua cảnh báo.
    /// </summary>
    private static async Task<DanhMuc?> LayDanhMucAsync(IServiceProvider dichVu, bool batBuoc, CancellationToken huy)
    {
        await using var pham = dichVu.CreateAsyncScope();
        var db = pham.ServiceProvider.GetService<AppDbContext>();
        if (db is null)
        {
            return batBuoc ? throw new LoiCoSoDuLieuException(ThongBao.LoiKhongKetNoi) : null;
        }

        try
        {
            var maThuTuc = await db.ThuTucs.AsNoTracking().Select(t => t.Ma).ToListAsync(huy);
            var maLinhVuc = await db.LinhVucs.AsNoTracking().Select(l => l.Ma).ToListAsync(huy);
            return new DanhMuc(maThuTuc.ToHashSet(StringComparer.Ordinal), maLinhVuc.ToHashSet(StringComparer.Ordinal));
        }
        catch (Exception e) when (e is NpgsqlException or InvalidOperationException or DbUpdateException)
        {
            return batBuoc ? throw new LoiCoSoDuLieuException(GhiChung.MoTaLoiDb(e)) : null;
        }
    }

    internal static async Task InLoiAsync(MucNhap muc, TextWriter loi)
    {
        await loi.WriteLineAsync(Chuoi.Dinh(ThongBao.KetQuaKhongNhap, muc.TenFile, muc.Loi.Count));
        foreach (var l in muc.Loi)
        {
            await loi.WriteLineAsync(l.Dong is null
                ? Chuoi.Dinh(ThongBao.KetQuaLoiKhongDong, l.Sheet, l.LyDo)
                : Chuoi.Dinh(ThongBao.KetQuaLoiCoDong, l.Sheet, l.Dong, l.LyDo));
        }
    }

    private static async Task InKetQuaAsync(MucNhap muc, TextWriter ra)
    {
        foreach (var dong in muc.TomTat())
        {
            await ra.WriteLineAsync(dong);
        }

        if (muc.CanhBao.Count > 0)
        {
            await ra.WriteLineAsync(ThongBao.KetQuaCanhBao);
            foreach (var c in muc.CanhBao)
            {
                await ra.WriteLineAsync(Chuoi.Dinh(ThongBao.KetQuaDongCanhBao, c.NoiDung));
            }
        }
    }
}
