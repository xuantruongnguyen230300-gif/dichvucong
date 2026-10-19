using DichVuCong.Data.Text;

namespace DichVuCong.Api.Features.Chatbot.TraLoi;

/// <summary>
/// Trả lời câu hỏi về Trung tâm theo mục (F06 BR-9, plan §4.6): đọc Trung tâm, giờ làm việc, liên kết lúc hỏi.
/// Mục chưa có dữ liệu thì <c>CoDuLieu</c> = false kèm <c>LienHe</c> (nút gọi), không đoán.
/// "Đang trong giờ / ngoài giờ" không tính ở máy chủ (F02 BR-9: theo đồng hồ máy người dùng).
/// </summary>
internal sealed class TraLoiTrungTam(DuLieuNho du)
{
    /// <summary>Tên liên kết của Trung tâm trỏ tới Cổng Dịch vụ công Quốc gia (lien-ket.md §1; F01 §14 câu 17). So sau <c>ChuanHoaTimKiem</c>.</summary>
    public const string TenLienKetCongDvc = "Cổng Dịch vụ công Quốc gia";

    private static readonly string TenLienKetChuan = TiengViet.ChuanHoaTimKiem(TenLienKetCongDvc);

    public async Task<CauTraLoiDto> TaoAsync(string muc, string? maDangNoi, CancellationToken ct)
    {
        var trungTam = await du.TrungTamAsync(ct);
        var thongTin = muc switch
        {
            MucTrungTamTroLy.DiaChi => trungTam is null || string.IsNullOrWhiteSpace(trungTam.DiaChi)
                ? KhongCo()
                : Co() with { DiaChi = trungTam.DiaChi, BanDo = trungTam.BanDo },
            MucTrungTamTroLy.DienThoai => trungTam is null || string.IsNullOrWhiteSpace(trungTam.DienThoai)
                ? KhongCo()
                : Co() with { DienThoai = trungTam.DienThoai },
            MucTrungTamTroLy.Email => trungTam is null || string.IsNullOrWhiteSpace(trungTam.Email)
                ? KhongCo()
                : Co() with { Email = trungTam.Email },
            MucTrungTamTroLy.GioLamViec => await GioLamViecAsync(trungTam, ct),
            MucTrungTamTroLy.NopTrucTuyen => await NopTrucTuyenAsync(ct),
            _ => throw new ArgumentOutOfRangeException(nameof(muc), muc, "Mục thông tin Trung tâm không hỗ trợ."),
        };

        return new CauTraLoiDto(LoaiCauTraLoi.TrungTam)
        {
            ThuTucDangNoi = maDangNoi,
            Muc = muc,
            ThongTin = thongTin,
            LienHe = thongTin.CoDuLieu || trungTam is null ? null : LienHe(trungTam),
        };
    }

    public static LienHeTroLyDto LienHe(TrungTamDoc trungTam)
        => new(trungTam.DienThoai, string.IsNullOrWhiteSpace(trungTam.ZaloOa) ? null : trungTam.ZaloOa);

    private async Task<ThongTinTrungTamMucDto> GioLamViecAsync(TrungTamDoc? trungTam, CancellationToken ct)
    {
        var gio = await du.GioLamViecAsync(ct);

        return gio.Count == 0 ? KhongCo() : Co() with { GioLamViec = gio, GhiChuNgayNghi = trungTam?.GhiChuNgayNghi };
    }

    private async Task<ThongTinTrungTamMucDto> NopTrucTuyenAsync(CancellationToken ct)
    {
        var lienKet = (await du.LienKetAsync(ct))
            .FirstOrDefault(l => string.Equals(TiengViet.ChuanHoaTimKiem(l.Ten), TenLienKetChuan, StringComparison.Ordinal));

        return lienKet is null ? KhongCo() : Co() with { LienKet = lienKet };
    }

    private static ThongTinTrungTamMucDto Co() => new(true, null, null, null, null, null, null, null);

    private static ThongTinTrungTamMucDto KhongCo() => new(false, null, null, null, null, null, null, null);
}
