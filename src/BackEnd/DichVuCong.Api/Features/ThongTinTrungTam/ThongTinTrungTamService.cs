using System.Globalization;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Entities;

namespace DichVuCong.Api.Features.ThongTinTrungTam;

public interface IThongTinTrungTamService
{
    /// <summary>Null khi chưa nhập dữ liệu Trung tâm lần nào.</summary>
    Task<ThongTinTrungTamDto?> LayAsync(CancellationToken cancellationToken);

    /// <summary>Null khi chưa nhập dữ liệu Trung tâm lần nào.</summary>
    Task<DacTaTrungTam?> LayDacTaAsync(CancellationToken cancellationToken);
}

public sealed class ThongTinTrungTamService(INguonDuLieu nguon) : IThongTinTrungTamService
{
    // Việt Nam dùng UTC+7 cố định, không có giờ mùa hè.
    private static readonly TimeSpan GioVietNam = TimeSpan.FromHours(7);

    /// <summary>Ngày (giờ Việt Nam) của một thời điểm.</summary>
    public static DateOnly NgayVietNam(DateTimeOffset thoiDiem) =>
        DateOnly.FromDateTime(thoiDiem.ToOffset(GioVietNam).DateTime);

    /// <summary>"HH:mm"; null giữ nguyên null.</summary>
    public static string? DinhDangGio(TimeOnly? gio) =>
        gio?.ToString("HH:mm", CultureInfo.InvariantCulture);

    public async Task<ThongTinTrungTamDto?> LayAsync(CancellationToken cancellationToken)
    {
        var dong = await nguon.TrungTams
            .Where(t => t.Id == TrungTam.IdDuyNhat)
            .Select(t => new
            {
                t.Ten, t.Xa, t.Tinh, t.CoQuanChuQuan, t.NguoiChiuTrachNhiem, t.ChucVuNguoiChiuTrachNhiem,
                t.DiaChi, t.DienThoai, t.Email, t.BanDo, t.ZaloOa, t.Facebook, t.YouTube, t.TikTok, t.GhiChuNgayNghi,
            })
            .DauTienAsync(cancellationToken);
        if (dong is null)
        {
            return null;
        }

        var lienKet = await nguon.LienKets
            .OrderBy(l => l.ThuTu)
            .Select(l => new LienKetDto(l.Ten, l.Url))
            .DanhSachAsync(cancellationToken);
        var oDichVu = await nguon.ODichVus
            .OrderBy(o => o.ThuTu)
            .Select(o => new ODichVuDto(o.Ten, o.BieuTuong, o.Url))
            .DanhSachAsync(cancellationToken);
        var gio = await nguon.GioLamViecs
            .OrderBy(g => g.Thu)
            .Select(g => new { g.Thu, g.SangTu, g.SangDen, g.ChieuTu, g.ChieuDen })
            .DanhSachAsync(cancellationToken);
        var ngay = await LayNgayCapNhatAsync(cancellationToken);

        return new ThongTinTrungTamDto(
            dong.Ten, dong.Xa, dong.Tinh, dong.CoQuanChuQuan, dong.NguoiChiuTrachNhiem,
            dong.ChucVuNguoiChiuTrachNhiem, dong.DiaChi, dong.DienThoai, dong.Email, dong.BanDo,
            new MangXaHoiDto(dong.ZaloOa, dong.Facebook, dong.YouTube, dong.TikTok),
            lienKet,
            oDichVu,
            [.. gio.Select(g => new GioLamViecDto(
                g.Thu, DinhDangGio(g.SangTu), DinhDangGio(g.SangDen), DinhDangGio(g.ChieuTu), DinhDangGio(g.ChieuDen)))],
            dong.GhiChuNgayNghi,
            ngay);
    }

    public async Task<DacTaTrungTam?> LayDacTaAsync(CancellationToken cancellationToken)
    {
        var dong = await nguon.TrungTams
            .Where(t => t.Id == TrungTam.IdDuyNhat)
            .Select(t => new { t.Ten, t.CoQuanChuQuan })
            .DauTienAsync(cancellationToken);
        if (dong is null)
        {
            return null;
        }

        return new DacTaTrungTam(dong.Ten, dong.CoQuanChuQuan, await LayNgayCapNhatAsync(cancellationToken));
    }

    private async Task<DateOnly?> LayNgayCapNhatAsync(CancellationToken cancellationToken)
    {
        var thoiDiem = await nguon.LanNhaps
            .Where(l => l.Loai == LanNhap.ThuTuc)
            .Select(l => (DateTimeOffset?)l.ThoiDiem)
            .DauTienAsync(cancellationToken);

        return thoiDiem is null ? null : NgayVietNam(thoiDiem.Value);
    }
}
