using DichVuCong.Data;
using DichVuCong.Data.Entities;
using DichVuCong.Import.Resources;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace DichVuCong.Import.Loai;

/// <summary>Phần ghi dùng chung: một transaction, khoá chống hai lần nhập chồng nhau, ghi <c>lan_nhap</c>.</summary>
internal static class GhiChung
{
    /// <summary>Số cố định cho <c>pg_try_advisory_xact_lock</c> ("DVCU"); chỉ công cụ nhập dùng.</summary>
    private const long KhoaAdvisory = 0x44564355;

    /// <summary>
    /// Chạy <paramref name="ghi"/> trong một transaction. Còn migration chưa chạy hoặc đang có lần nhập khác thì không ghi.
    /// Lỗi bất kỳ (kể cả huỷ) → rollback, dữ liệu cũ giữ nguyên. Trả mã thoát.
    /// </summary>
    public static async Task<int> TrongGiaoDichAsync(
        IServiceProvider dichVu,
        TextWriter loi,
        Func<AppDbContext, CancellationToken, Task> ghi,
        CancellationToken huy)
    {
        ArgumentNullException.ThrowIfNull(dichVu);
        ArgumentNullException.ThrowIfNull(loi);
        ArgumentNullException.ThrowIfNull(ghi);

        try
        {
            await using var pham = dichVu.CreateAsyncScope();
            var db = pham.ServiceProvider.GetRequiredService<AppDbContext>();

            if ((await db.Database.GetPendingMigrationsAsync(huy)).Any())
            {
                await loi.WriteLineAsync(ThongBao.LoiMigrationChuaChay);
                return (int)MaThoat.LoiHeThong;
            }

            await using var giaoDich = await db.Database.BeginTransactionAsync(huy);

            var khoa = await db.Database
                .SqlQuery<bool>($"SELECT pg_try_advisory_xact_lock({KhoaAdvisory}) AS \"Value\"")
                .SingleAsync(huy);
            if (!khoa)
            {
                await loi.WriteLineAsync(ThongBao.LoiDangCoLanNhapKhac);
                return (int)MaThoat.LoiHeThong;
            }

            await ghi(db, huy);
            await giaoDich.CommitAsync(huy);
            return (int)MaThoat.ThanhCong;
        }
        catch (OperationCanceledException)
        {
            await loi.WriteLineAsync(ThongBao.LoiBiHuy);
            return (int)MaThoat.LoiHeThong;
        }
        catch (Exception e) when (e is DbUpdateException or NpgsqlException or InvalidOperationException)
        {
            // Chỉ in loại lỗi và mã SQLSTATE: thông báo gốc có thể chứa địa chỉ máy chủ.
            await loi.WriteLineAsync(MoTaLoiDb(e));
            return (int)MaThoat.LoiHeThong;
        }
    }

    /// <summary>Thêm hoặc cập nhật dòng <c>lan_nhap</c> của <paramref name="loai"/> (ngày nhập thành công gần nhất — BR-7).</summary>
    public static async Task GhiLanNhapAsync(
        AppDbContext db,
        string loai,
        string duongDanFile,
        TimeProvider thoiGian,
        CancellationToken huy)
    {
        var tenFile = Path.GetFileName(duongDanFile);
        var bayGio = thoiGian.GetUtcNow();

        var lan = await db.LanNhaps.FindAsync([loai], huy);
        if (lan is null)
        {
            db.LanNhaps.Add(new LanNhap { Loai = loai, ThoiDiem = bayGio, TenFile = tenFile });
        }
        else
        {
            lan.ThoiDiem = bayGio;
            lan.TenFile = tenFile;
        }

        await db.SaveChangesAsync(huy);
        db.ChangeTracker.Clear();
    }

    /// <summary>Tìm hiểu nguyên nhân lỗi kết nối hay lỗi ghi để chọn câu thông báo, không in thông báo gốc.</summary>
    internal static string MoTaLoiDb(Exception e)
    {
        var goc = e.GetBaseException();
        var ketNoi = goc is not PostgresException && goc is NpgsqlException or System.Net.Sockets.SocketException;

        var mau = ketNoi ? ThongBao.LoiKhongKetNoi : ThongBao.LoiGhiDuLieu;
        var chiTiet = goc is PostgresException p ? $"{p.GetType().Name} {p.SqlState}" : goc.GetType().Name;
        return $"{mau} ({chiTiet})";
    }
}
