using DichVuCong.Api.Features.Chatbot.TimKiem;

namespace DichVuCong.Api.Features.Chatbot.TraLoi;

/// <summary>
/// Bước 1 (nhóm Trung tâm, F06 BR-9) và bước 2 (câu trả lời mẫu): khớp cách hỏi mẫu đủ chắc. Mẫu có <c>MucTrungTam</c> thì trả
/// thông tin Trung tâm đọc lúc hỏi; mẫu có <c>TraLoi</c> thì trả nguyên văn.
/// </summary>
/// <remarks>
/// Mẫu Trung tâm bị bỏ qua (xuống bước 3 như thể không khớp) khi câu nêu thủ tục (BR-9, bullet cuối): (a) thủ tục xác định được
/// và câu không trùng khít một cách hỏi mẫu — "trung tâm ở đâu" trùng chữ với tên thủ tục "…trung tâm học tập cộng đồng" nhưng vẫn
/// là câu hỏi địa chỉ; hoặc (b) mục nộp trực tuyến mà câu hỏi nơi nộp và đang có thủ tục đang nói tới.
/// </remarks>
internal sealed class BuocCauHoiMau(TraLoiTrungTam trungTam) : IChatHandler
{
    /// <summary>Cách hỏi mẫu trùng khít với câu hỏi (sau chuẩn hoá): chắc chắn là câu về Trung tâm, thủ tục trùng chữ ngẫu nhiên không được lấn át.</summary>
    private const double DiemTuyetDoi = 0.999999;

    public int ThuTu => 30;

    public async Task<CauTraLoiDto?> XuLyAsync(NguCanhHoi nguCanh, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(nguCanh);

        var khop = ChamDiem.TimMau(nguCanh.ChiMuc, nguCanh.PhanTich, nguCanh.Opt);
        if (khop is null || !nguCanh.ChiMuc.Maus.TryGetValue(khop.Cach.CauThuTu, out var mau))
        {
            return null;
        }

        if (mau.MucTrungTam is { } muc)
        {
            return BiBoQua(nguCanh, muc, khop.Dice) ? null : await trungTam.TaoAsync(muc, nguCanh.MaDangNoi, ct);
        }

        if (mau.TraLoi is null)
        {
            return null;
        }

        var lienQuan = mau.MaThuTuc.Select(nguCanh.ChiMuc.TheoMa).OfType<ThuTucChiMuc>().Select(t => t.Dto).ToList();

        return new CauTraLoiDto(LoaiCauTraLoi.CauHoiMau)
        {
            ThuTucDangNoi = lienQuan.Count == 1 ? lienQuan[0].Ma : nguCanh.MaDangNoi,
            TraLoi = mau.TraLoi,
            DanhSachThuTuc = lienQuan,
        };
    }

    private static bool BiBoQua(NguCanhHoi nguCanh, string muc, double diemMau)
        => (nguCanh.UngDauChac is not null && diemMau < DiemTuyetDoi)
            || (string.Equals(muc, MucTrungTamTroLy.NopTrucTuyen, StringComparison.Ordinal)
                && string.Equals(nguCanh.PhanTich.MucHoi, MucThuTucTroLy.NoiNop, StringComparison.Ordinal)
                && nguCanh.ThuTucDangNoi is not null);
}
