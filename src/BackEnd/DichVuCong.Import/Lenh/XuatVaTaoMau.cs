using DichVuCong.Data;
using DichVuCong.Data.Entities;
using DichVuCong.Import.Excel;
using DichVuCong.Import.Loai;
using DichVuCong.Import.Resources;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace DichVuCong.Import.Lenh;

/// <summary>Lệnh <c>xuat cau-chua-tra-loi</c> (plan F01 §5.1, §10).</summary>
internal static class XuatDuLieu
{
    public static async Task<int> ChayAsync(
        LenhXuat lenh,
        IServiceProvider dichVu,
        TextWriter ra,
        TextWriter loi,
        CancellationToken huy)
    {
        if (!string.Equals(Path.GetExtension(lenh.FileRa), ".xlsx", StringComparison.OrdinalIgnoreCase))
        {
            await loi.WriteLineAsync(Chuoi.Dinh(ThongBao.LoiFileRaDuoi, lenh.FileRa));
            return (int)MaThoat.SaiLenh;
        }

        if (File.Exists(lenh.FileRa))
        {
            await loi.WriteLineAsync(Chuoi.Dinh(ThongBao.LoiFileRaDaCo, lenh.FileRa));
            return (int)MaThoat.SaiLenh;
        }

        var thoiGian = dichVu.GetService<TimeProvider>() ?? TimeProvider.System;

        List<CauChuaTraLoi> tatCa;
        try
        {
            await using var pham = dichVu.CreateAsyncScope();
            var db = pham.ServiceProvider.GetRequiredService<AppDbContext>();
            tatCa = await db.CauChuaTraLois.AsNoTracking().ToListAsync(huy);
        }
        catch (Exception e) when (e is NpgsqlException or InvalidOperationException)
        {
            await loi.WriteLineAsync(GhiChung.MoTaLoiDb(e));
            return (int)MaThoat.LoiHeThong;
        }

        var cau = ChonCauXuat(tatCa, thoiGian.GetUtcNow());

        try
        {
            var thuMucRa = Path.GetDirectoryName(Path.GetFullPath(lenh.FileRa));
            if (!string.IsNullOrEmpty(thuMucRa))
            {
                Directory.CreateDirectory(thuMucRa);
            }

            using var sach = GhiExcel.TaoXuat(cau);
            GhiExcel.LuuMoi(sach, lenh.FileRa);
        }
        catch (IOException) when (File.Exists(lenh.FileRa))
        {
            // File xuất hiện giữa lúc kiểm và lúc ghi.
            await loi.WriteLineAsync(Chuoi.Dinh(ThongBao.LoiFileRaDaCo, lenh.FileRa));
            return (int)MaThoat.SaiLenh;
        }

        await ra.WriteLineAsync(Chuoi.Dinh(ThongBao.KetQuaXuat, cau.Count, lenh.FileRa));
        return (int)MaThoat.ThanhCong;
    }

    /// <summary>
    /// Chỉ câu có lần gặp cuối trong <see cref="CauChuaTraLoi.ThoiGianGiu"/> (đúng cả khi việc xoá định kỳ chưa chạy tới),
    /// xếp theo số lần gặp giảm dần rồi lần gặp cuối giảm dần.
    /// </summary>
    internal static List<CauChuaTraLoi> ChonCauXuat(IEnumerable<CauChuaTraLoi> tatCa, DateTimeOffset bayGio)
    {
        var hanDuoi = bayGio - CauChuaTraLoi.ThoiGianGiu;
        return tatCa
            .Where(c => c.LanGapCuoi >= hanDuoi)
            .OrderByDescending(c => c.SoLanGap)
            .ThenByDescending(c => c.LanGapCuoi)
            .ToList();
    }
}

/// <summary>Lệnh <c>tao-mau</c>: 4 file Excel trống theo <see cref="MauExcel"/>.</summary>
internal static class TaoMauFile
{
    public static async Task<int> ChayAsync(LenhTaoMau lenh, TextWriter ra, TextWriter loi)
    {
        // Không ghi đè: file mẫu có thể đã được điền dữ liệu thật.
        var daCo = MauExcel.TatCa
            .Select(m => Path.Combine(lenh.ThuMuc, m.TenFile))
            .Where(File.Exists)
            .ToList();
        if (daCo.Count > 0)
        {
            await loi.WriteLineAsync(Chuoi.Dinh(ThongBao.LoiMauDaCo, daCo[0]));
            return (int)MaThoat.SaiLenh;
        }

        Directory.CreateDirectory(lenh.ThuMuc);
        foreach (var mau in MauExcel.TatCa)
        {
            var duongDan = Path.Combine(lenh.ThuMuc, mau.TenFile);
            using var sach = GhiExcel.TaoMau(mau);
            GhiExcel.LuuMoi(sach, duongDan);
            await ra.WriteLineAsync(Chuoi.Dinh(ThongBao.KetQuaTaoMau, duongDan));
        }

        return (int)MaThoat.ThanhCong;
    }
}
