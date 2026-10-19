using DichVuCong.Api.Features.ThongTinTrungTam;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Entities;

namespace DichVuCong.Api.Features.Chatbot.TraLoi;

/// <summary>Dòng Trung tâm đủ cho câu trả lời của trợ lý.</summary>
internal sealed record TrungTamDoc(string Ten, string DiaChi, string DienThoai, string Email, string? BanDo, string? ZaloOa, string? GhiChuNgayNghi)
{
    public TrungTamNganDto Ngan => new(Ten, DiaChi);
}

internal sealed record PhanCongDoc(int? Quay, string? NoiTiepNhanChuyen);

internal sealed record NhanSuDoc(string HoTen, string? XungHo, string? ChucVu, int? Quay, string? MoTa)
{
    public CanBoDto Dto => new(HoTen, XungHo, ChucVu, Quay, MoTa);
}

/// <summary>
/// Các bảng nhỏ (dưới 10 dòng) đọc mỗi lần cần, để câu trả lời luôn theo dữ liệu hiện tại (plan F06 Q6, AC-18):
/// Trung tâm, giờ làm việc, liên kết, phân công, nhân sự. Qua <see cref="INguonDuLieu"/>, <c>Select</c> thẳng ra kiểu riêng (R1, R2).
/// </summary>
internal sealed class DuLieuNho(INguonDuLieu nguon)
{
    public Task<TrungTamDoc?> TrungTamAsync(CancellationToken ct) => nguon.TrungTams
        .Where(t => t.Id == TrungTam.IdDuyNhat)
        .Select(t => new TrungTamDoc(t.Ten, t.DiaChi, t.DienThoai, t.Email, t.BanDo, t.ZaloOa, t.GhiChuNgayNghi))
        .DauTienAsync(ct);

    public async Task<IReadOnlyList<GioLamViecDto>> GioLamViecAsync(CancellationToken ct)
    {
        var dong = await nguon.GioLamViecs
            .OrderBy(g => g.Thu)
            .Select(g => new { g.Thu, g.SangTu, g.SangDen, g.ChieuTu, g.ChieuDen })
            .DanhSachAsync(ct);

        return [.. dong.Select(g => new GioLamViecDto(
            g.Thu,
            ThongTinTrungTamService.DinhDangGio(g.SangTu),
            ThongTinTrungTamService.DinhDangGio(g.SangDen),
            ThongTinTrungTamService.DinhDangGio(g.ChieuTu),
            ThongTinTrungTamService.DinhDangGio(g.ChieuDen)))];
    }

    public async Task<IReadOnlyList<LienKetDto>> LienKetAsync(CancellationToken ct)
        => await nguon.LienKets.OrderBy(l => l.ThuTu).Select(l => new LienKetDto(l.Ten, l.Url)).DanhSachAsync(ct);

    /// <summary>Dòng phân công của lĩnh vực; null nếu lĩnh vực chưa có dòng.</summary>
    public Task<PhanCongDoc?> PhanCongAsync(string linhVucMa, CancellationToken ct) => nguon.PhanCongLinhVucs
        .Where(p => p.LinhVucMa == linhVucMa)
        .Select(p => new PhanCongDoc(p.Quay, p.NoiTiepNhanChuyen))
        .DauTienAsync(ct);

    public async Task<IReadOnlyList<NhanSuDoc>> NhanSuAsync(CancellationToken ct)
        => await nguon.NhanSus
            .OrderBy(n => n.ThuTu)
            .Select(n => new NhanSuDoc(n.HoTen, n.XungHo, n.ChucVu, n.Quay, n.MoTa))
            .DanhSachAsync(ct);
}
