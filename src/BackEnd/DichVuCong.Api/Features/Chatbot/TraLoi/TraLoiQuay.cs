using DichVuCong.Api.Features.Chatbot.TimKiem;

namespace DichVuCong.Api.Features.Chatbot.TraLoi;

/// <summary>
/// Bước 1 (F06 BR-1): hỏi về quầy hoặc cán bộ → trả lời theo bảng phân công và nhân sự. Không đoán quầy, không đoán cán bộ
/// (BR-3): lĩnh vực chưa có quầy → <c>Quay</c> null; chưa có nhân sự → <c>CanBo</c> rỗng; tên cán bộ chỉ từ bảng nhân sự.
/// Quầy lấy từ phân công thật nên được nêu kể cả khi chưa có nhân sự (plan §12, Cần hỏi 3).
/// </summary>
internal sealed class TraLoiQuay(DuLieuNho du) : IChatHandler
{
    /// <summary>Số cán bộ tối đa trong một đáp án (theo Vàm Cỏ).</summary>
    public const int SoCanBoToiDa = 10;

    public int ThuTu => 20;

    public async Task<CauTraLoiDto?> XuLyAsync(NguCanhHoi nguCanh, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(nguCanh);

        var cau = nguCanh.PhanTich;
        var nhanSu = await du.NhanSuAsync(ct);
        var theoTen = TimTheoTen(cau.Tho, nhanSu);
        var hoiCanBo = cau.HoiCanBo || theoTen.Count > 0;
        if (!hoiCanBo && !cau.HoiQuay)
        {
            return null;
        }

        var linhVuc = XacDinhLinhVuc(nguCanh);
        var phanCong = linhVuc is null ? null : await du.PhanCongAsync(linhVuc.Ma, ct);
        var trungTam = await du.TrungTamAsync(ct);

        IReadOnlyList<NhanSuDoc> canBo = [];
        var quay = phanCong?.Quay;
        if (hoiCanBo)
        {
            if (theoTen.Count > 0)
            {
                canBo = theoTen;
                quay ??= theoTen[0].Quay;
            }
            else if (cau.SoQuay is { } soQuay)
            {
                canBo = [.. nhanSu.Where(n => n.Quay == soQuay)];
                quay = canBo.Count > 0 || phanCong?.Quay == soQuay ? soQuay : null;
            }
            else if (quay is { } quayLinhVuc)
            {
                canBo = [.. nhanSu.Where(n => n.Quay == quayLinhVuc)];
            }
        }

        return new CauTraLoiDto(LoaiCauTraLoi.Quay)
        {
            ThuTucDangNoi = nguCanh.MaDangNoi,
            Muc = hoiCanBo ? MucQuayTroLy.CanBo : MucQuayTroLy.Quay,
            LinhVuc = linhVuc?.Ten,
            Quay = quay,
            NoiTiepNhanChuyen = phanCong?.NoiTiepNhanChuyen,
            CanBo = [.. canBo.Take(SoCanBoToiDa).Select(n => n.Dto)],
            Tong = canBo.Count,
            TrungTam = trungTam?.Ngan,
        };
    }

    /// <summary>Lĩnh vực được hỏi: tên có trong câu (tên dài nhất thắng) → lĩnh vực của thủ tục đủ chắc → của thủ tục đang nói tới.</summary>
    private static LinhVucChiMuc? XacDinhLinhVuc(NguCanhHoi nguCanh)
    {
        var chiMuc = nguCanh.ChiMuc;
        LinhVucChiMuc? tot = null;
        foreach (var l in chiMuc.LinhVucs)
        {
            if (l.Tu.Length > (tot?.Tu.Length ?? 0) && ChuoiTu.ChuaDay(nguCanh.PhanTich.Day, l.Tu))
            {
                tot = l;
            }
        }

        if (tot is not null)
        {
            return tot;
        }

        var ma = nguCanh.UngDauChac?.ThuTuc.LinhVucMa ?? nguCanh.ThuTucDangNoi?.LinhVucMa;

        return ma is null ? null : chiMuc.LinhVucs.FirstOrDefault(l => string.Equals(l.Ma, ma, StringComparison.Ordinal));
    }

    /// <summary>
    /// Nhân sự được gọi tên trong câu (cổng từ <c>timTheoTen</c> của Vàm Cỏ, trên dãy từ). <c>tenGoi</c> là từ cuối của họ tên.
    /// Khớp khi (a) cả họ tên liền nhau trong câu, hoặc (b) "anh"/"chị" ngay trước <c>tenGoi</c>, hoặc (c) "gặp", "liên hệ", "tìm",
    /// "gọi điện", "nói chuyện" đứng trước, cách tối đa một từ "anh"/"chị", rồi <c>tenGoi</c>. <c>tenGoi</c> đứng một mình không khớp
    /// (trùng từ thường như "nhưng", "hàng").
    /// </summary>
    internal static List<NhanSuDoc> TimTheoTen(IReadOnlyList<string> tho, IReadOnlyList<NhanSuDoc> nhanSu)
    {
        var ketQua = new List<NhanSuDoc>();
        foreach (var n in nhanSu)
        {
            var ten = ChuoiTu.Tach(n.HoTen);
            if (ten.Length > 0 && (KhopHoTen(tho, ten) || KhopTenGoi(tho, ten[^1])))
            {
                ketQua.Add(n);
            }
        }

        return ketQua;
    }

    private static bool KhopHoTen(IReadOnlyList<string> tho, string[] hoTen) => hoTen.Length >= 2 && ChuoiTu.ChuaDay(tho, hoTen);

    private static bool KhopTenGoi(IReadOnlyList<string> tho, string tenGoi)
    {
        for (var i = 0; i < tho.Count; i++)
        {
            if (!string.Equals(tho[i], tenGoi, StringComparison.Ordinal))
            {
                continue;
            }

            var truoc = i - 1;
            if (truoc >= 0 && (string.Equals(tho[truoc], NgonNguHoi.TuAnh[0], StringComparison.Ordinal)
                || string.Equals(tho[truoc], NgonNguHoi.TuChi[0], StringComparison.Ordinal)))
            {
                return true;
            }

            if (NgonNguHoi.CumGoiTen.Any(c => ChuoiTu.KhopDenHet(tho, truoc, c)))
            {
                return true;
            }
        }

        return false;
    }
}
