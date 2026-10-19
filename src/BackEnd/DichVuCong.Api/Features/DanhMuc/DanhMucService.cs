using DichVuCong.Api.Features.ChiTietThuTuc;
using DichVuCong.Data.DuLieu;

namespace DichVuCong.Api.Features.DanhMuc;

public interface IDanhMucService
{
    /// <summary>Thủ tục thuộc ít nhất một cấp, theo thứ tự nhập (<c>ThuTu</c>). Rỗng khi chưa nhập dữ liệu.</summary>
    Task<IReadOnlyList<ThuTucRutGonDto>> LayThuTucAsync(CancellationToken cancellationToken);

    /// <summary>Lĩnh vực có ít nhất một thủ tục, theo tên đã bỏ dấu. Rỗng khi chưa nhập dữ liệu.</summary>
    Task<IReadOnlyList<LinhVucDto>> LayLinhVucAsync(CancellationToken cancellationToken);
}

public sealed class DanhMucService(INguonDuLieu nguon) : IDanhMucService
{
    public async Task<IReadOnlyList<ThuTucRutGonDto>> LayThuTucAsync(CancellationToken cancellationToken)
    {
        // Chỉ chiếu các cột danh mục cần; cách thức nộp lấy nguyên cột JSON rồi chọn thời hạn rõ ràng trong C# (không trả ra, R2).
        // Không chiếu t.CachThuc.Select(...): EF dịch thành LATERAL jsonb_to_recordset ... WITH ORDINALITY mà ORDER BY không có
        // cột ordinality nên thứ tự phần tử không được bảo đảm (thử trên PostgreSQL thỉnh thoảng đảo thứ tự).
        var dong = await nguon.ThuTucs
            .Where(t => t.ThuocDanhMucXa || t.ThuocDanhMucTinh)
            .OrderBy(t => t.ThuTu)
            .Select(t => new
            {
                t.Ma,
                t.Ten,
                t.TenTimKiem,
                t.LinhVucMa,
                t.MucDo,
                t.ThuocDanhMucXa,
                t.ThuocDanhMucTinh,
                t.ThuTuThuongGap,
                t.ThoiHan,
                t.CoQuanThucHien,
                t.CachThuc,
            })
            .DanhSachAsync(cancellationToken);

        // Đổi sang chuỗi và chọn thời hạn trong C# sau khi lấy: không đặt trong biểu thức truy vấn (R4).
        return
        [
            .. dong.Select(d => new ThuTucRutGonDto(
                d.Ma,
                d.Ten,
                d.TenTimKiem,
                d.LinhVucMa,
                MucDoChuoi.Tu(d.MucDo),
                d.ThuocDanhMucXa,
                d.ThuocDanhMucTinh,
                d.ThuTuThuongGap,
                ThoiHanThuTuc.Chon(d.ThoiHan, d.CachThuc.Select(c => c.ThoiHan)),
                d.CoQuanThucHien)),
        ];
    }

    public async Task<IReadOnlyList<LinhVucDto>> LayLinhVucAsync(CancellationToken cancellationToken)
    {
        var linhVuc = await nguon.LinhVucs
            .Select(l => new { l.Ma, l.Ten, l.TenTimKiem })
            .DanhSachAsync(cancellationToken);
        var thuTuc = await nguon.ThuTucs
            .Select(t => new { t.LinhVucMa, t.ThuocDanhMucXa, t.ThuocDanhMucTinh })
            .DanhSachAsync(cancellationToken);

        // Đếm trong bộ nhớ, không GroupBy trong truy vấn: hai nguồn cho cùng kết quả mà không phụ thuộc cách EF dịch.
        var soTheoLinhVuc = new Dictionary<string, (int Xa, int Tinh)>(StringComparer.Ordinal);
        foreach (var t in thuTuc)
        {
            soTheoLinhVuc.TryGetValue(t.LinhVucMa, out var so);
            soTheoLinhVuc[t.LinhVucMa] = (so.Xa + (t.ThuocDanhMucXa ? 1 : 0), so.Tinh + (t.ThuocDanhMucTinh ? 1 : 0));
        }

        // Thứ tự theo chuỗi đã bỏ dấu, so Ordinal (không theo văn hoá hay collation của DB — R3), rồi theo mã.
        return
        [
            .. linhVuc
                .Where(l => soTheoLinhVuc.TryGetValue(l.Ma, out var so) && so.Xa + so.Tinh > 0)
                .OrderBy(l => l.TenTimKiem, StringComparer.Ordinal)
                .ThenBy(l => l.Ma, StringComparer.Ordinal)
                .Select(l => new LinhVucDto(l.Ma, l.Ten, l.TenTimKiem, soTheoLinhVuc[l.Ma].Xa, soTheoLinhVuc[l.Ma].Tinh)),
        ];
    }
}
