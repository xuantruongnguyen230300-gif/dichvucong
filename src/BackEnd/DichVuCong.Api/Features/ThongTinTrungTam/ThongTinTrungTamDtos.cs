namespace DichVuCong.Api.Features.ThongTinTrungTam;

/// <summary>
/// Thông tin Trung tâm cho đầu trang, chân trang, ô dịch vụ, giờ làm việc.
/// <see cref="DienThoai"/> ở gốc JSON: script trình duyệt cũ (F00 T21) đọc đúng tên này.
/// </summary>
public sealed record ThongTinTrungTamDto(
    string Ten,
    string? Xa,
    string? Tinh,
    string? CoQuanChuQuan,
    string NguoiChiuTrachNhiem,
    string? ChucVuNguoiChiuTrachNhiem,
    string DiaChi,
    string DienThoai,
    string Email,
    string? BanDo,
    MangXaHoiDto MangXaHoi,
    IReadOnlyList<LienKetDto> LienKet,
    IReadOnlyList<ODichVuDto> ODichVu,
    IReadOnlyList<GioLamViecDto> GioLamViec,
    string? GhiChuNgayNghi,
    DateOnly? NgayCapNhatThuTuc);

public sealed record MangXaHoiDto(string? ZaloOa, string? Facebook, string? YouTube, string? TikTok);

public sealed record LienKetDto(string Ten, string Url);

public sealed record ODichVuDto(string Ten, string BieuTuong, string? Url);

/// <summary>Giờ dạng "HH:mm". <see cref="Thu"/>: 1 = Thứ Hai ... 7 = Chủ nhật.</summary>
public sealed record GioLamViecDto(int Thu, string? SangTu, string? SangDen, string? ChieuTu, string? ChieuDen);

/// <summary>Phần dữ liệu Trung tâm chèn vào HTML khi trả trang (dữ liệu đặc tả).</summary>
public sealed record DacTaTrungTam(string Ten, string? CoQuanChuQuan, DateOnly? NgayCapNhatThuTuc);
