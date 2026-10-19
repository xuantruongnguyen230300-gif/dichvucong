using DichVuCong.Api.Features.Chatbot.TimKiem;

namespace DichVuCong.Api.Features.Chatbot.TraLoi;

/// <summary>
/// Bấm một chủ đề gợi ý → thủ tục của đúng lĩnh vực gắn với chủ đề (F06 BR-11, plan §4.6). So theo mã lĩnh vực, không tách từ
/// ("Chăn nuôi" không lẫn "Nuôi con nuôi"); mỗi thủ tục một lần dù thuộc cả hai cấp.
/// </summary>
internal sealed class TraLoiChuDe(DuLieuNho du)
{
    public const int SoThuTucToiDa = 10;

    /// <summary>Null nếu không có chủ đề thứ tự <paramref name="thuTu"/>.</summary>
    public async Task<CauTraLoiDto?> TaoAsync(ChiMucTroLy chiMuc, int thuTu, ThuTucChiMuc? dangNoi, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(chiMuc);

        var chuDe = chiMuc.ChuDes.FirstOrDefault(c => c.ThuTu == thuTu);
        if (chuDe is null)
        {
            return null;
        }

        var thuTuc = chiMuc.CuaLinhVuc(chuDe.LinhVucMa);
        var cau = new CauTraLoiDto(LoaiCauTraLoi.ChuDe)
        {
            ThuTucDangNoi = thuTuc.Count == 1 ? thuTuc[0].Ma : dangNoi?.Ma,
            ChuDe = new ChuDeTraLoiDto(chuDe.TenHienThi, chuDe.TenLinhVuc),
            Tong = thuTuc.Count,
            DanhSachThuTuc = [.. thuTuc.Take(SoThuTucToiDa).Select(t => t.Dto)],
        };
        if (thuTuc.Count == 0)
        {
            return cau;
        }

        var phanCong = await du.PhanCongAsync(chuDe.LinhVucMa, ct);
        var trungTam = await du.TrungTamAsync(ct);

        return cau with { Quay = phanCong?.Quay, NoiTiepNhanChuyen = phanCong?.NoiTiepNhanChuyen, TrungTam = trungTam?.Ngan };
    }
}
