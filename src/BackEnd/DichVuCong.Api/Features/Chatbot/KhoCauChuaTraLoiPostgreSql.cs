using DichVuCong.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DichVuCong.Api.Features.Chatbot;

/// <summary>
/// Kho câu chưa trả lời trong PostgreSQL (nguồn <c>PostgreSql</c>). Ghi bằng một câu <c>INSERT … ON CONFLICT</c>
/// nên nhiều bản API ghi cùng lúc vẫn cộng đúng số lần gặp. Có trần <see cref="KhoCauChuaTraLoiOptions.SoDongToiDa"/> dòng
/// (không truyền <c>options</c> thì dùng <see cref="KhoCauChuaTraLoiOptions.SoDongMacDinh"/>; DI luôn truyền).
/// </summary>
internal sealed class KhoCauChuaTraLoiPostgreSql(
    AppDbContext db,
    TimeProvider timeProvider,
    IOptions<KhoCauChuaTraLoiOptions>? options = null,
    CanhBaoKhoDay? canhBao = null) : IKhoCauChuaTraLoi
{
    public async Task GhiAsync(string noiDung, CancellationToken ct)
    {
        var cau = GopCauChuaTraLoi.ChuanBi(noiDung);
        var bayGio = timeProvider.GetUtcNow();
        var soDongToiDa = options?.Value.SoDongToiDa ?? KhoCauChuaTraLoiOptions.SoDongMacDinh;

        // Chuỗi nội suy -> FormattableString: EF biến mỗi giá trị thành tham số, không nối vào câu SQL (F01 plan §8.1).
        // Câu có sẵn thì luôn ghi (cộng số lần gặp); câu mới chỉ thêm khi bảng còn dưới trần, không thì không ghi gì.
        // Không dòng nào bị ảnh hưởng = câu mới mà kho đã đầy → báo (giới hạn một dòng log mỗi giờ).
        var soDong = await db.Database.ExecuteSqlAsync(
            $"""
            INSERT INTO cau_chua_tra_loi (noi_dung, khoa_gop, so_lan_gap, lan_gap_cuoi)
            SELECT {cau.NoiDung}, {cau.KhoaGop}, 1, {bayGio}
            WHERE EXISTS (SELECT 1 FROM cau_chua_tra_loi WHERE khoa_gop = {cau.KhoaGop})
               OR (SELECT count(*) FROM cau_chua_tra_loi) < {soDongToiDa}
            ON CONFLICT (khoa_gop) DO UPDATE
            SET so_lan_gap = cau_chua_tra_loi.so_lan_gap + 1, lan_gap_cuoi = EXCLUDED.lan_gap_cuoi
            """,
            ct);

        if (soDong == 0)
        {
            canhBao?.Bao(soDongToiDa);
        }
    }

    public async Task<int> XoaQuaHanAsync(DateTimeOffset moc, CancellationToken ct) =>
        await db.CauChuaTraLois
            .Where(cau => cau.LanGapCuoi < moc)
            .ExecuteDeleteAsync(ct);
}
