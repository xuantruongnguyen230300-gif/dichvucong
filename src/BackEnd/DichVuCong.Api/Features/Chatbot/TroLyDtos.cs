using System.ComponentModel.DataAnnotations;
using DichVuCong.Api.Features.ChiTietThuTuc;
using DichVuCong.Api.Features.ThongTinTrungTam;

namespace DichVuCong.Api.Features.Chatbot;

/// <summary>Câu hỏi gửi lên. Câu nằm trong body, không bao giờ trên địa chỉ (plan F06 Q1).</summary>
public sealed record HoiRequest(
    [Required, StringLength(500, MinimumLength = 1)] string CauHoi,
    [StringLength(20)] string? MaThuTuc);

/// <summary>Bấm một chủ đề gợi ý (F06 BR-11). <see cref="ThuTu"/> là thứ tự trong <c>GET /api/tro-ly/chu-de</c>.</summary>
public sealed record HoiChuDeRequest(
    [Range(1, 1000)] int ThuTu,
    [StringLength(20)] string? MaThuTuc);

/// <summary>Giá trị của <see cref="CauTraLoiDto.Loai"/>.</summary>
public static class LoaiCauTraLoi
{
    public const string ThuTuc = "thu-tuc";
    public const string ThuTucDanhSach = "thu-tuc-danh-sach";
    public const string ChuDe = "chu-de";
    public const string CauHoiMau = "cau-hoi-mau";
    public const string TrungTam = "trung-tam";
    public const string Quay = "quay";
    public const string KhongHieu = "khong-hieu";
}

/// <summary>Giá trị của <see cref="CauTraLoiDto.Muc"/> khi <c>Loai</c> là <c>thu-tuc</c>.</summary>
public static class MucThuTucTroLy
{
    public const string ThoiHan = "thoi-han";
    public const string HoSo = "ho-so";
    public const string Phi = "phi";
    public const string NoiNop = "noi-nop";
    public const string TrinhTu = "trinh-tu";
    public const string KetQua = "ket-qua";
    public const string CanCu = "can-cu";
}

/// <summary>Giá trị của <see cref="CauTraLoiDto.Muc"/> khi <c>Loai</c> là <c>trung-tam</c>.</summary>
public static class MucTrungTamTroLy
{
    public const string DiaChi = "dia-chi";
    public const string GioLamViec = "gio-lam-viec";
    public const string DienThoai = "dien-thoai";
    public const string Email = "email";
    public const string NopTrucTuyen = "nop-truc-tuyen";
}

/// <summary>Giá trị của <see cref="CauTraLoiDto.Muc"/> khi <c>Loai</c> là <c>quay</c>.</summary>
public static class MucQuayTroLy
{
    public const string Quay = "quay";
    public const string CanBo = "can-bo";
}

/// <summary><c>MucDo</c> là <c>toan-trinh</c> hoặc <c>mot-phan</c> (<see cref="MucDoChuoi"/>).</summary>
public sealed record ThuTucNganDto(string Ma, string Ten, string LinhVuc, string MucDo, bool CapXa, bool CapTinh);

public sealed record TrungTamNganDto(string Ten, string DiaChi);

/// <summary>Nút gọi luôn có; nút Zalo chỉ khi <see cref="ZaloOa"/> khác null (F06 BR-10).</summary>
public sealed record LienHeTroLyDto(string DienThoai, string? ZaloOa);

public sealed record CanBoDto(string HoTen, string? XungHo, string? ChucVu, int? Quay, string? MoTa);

/// <summary><see cref="LinhVuc"/> là tên lĩnh vực trong danh mục.</summary>
public sealed record ChuDeTraLoiDto(string TenHienThi, string LinhVuc);

public sealed record ChuDeGoiYDto(int ThuTu, string TenHienThi);

/// <summary>
/// Nội dung một mục của thủ tục. Chỉ trường của mục được hỏi có giá trị; <see cref="Tong"/> là tổng số phần tử
/// của danh sách đã bị cắt bớt, null khi không cắt.
/// </summary>
public sealed record NoiDungMucDto(
    string? ThoiHan,
    string? Phi,
    IReadOnlyList<string>? HinhThucNop,
    IReadOnlyList<GiayToDto>? ThanhPhanHoSo,
    IReadOnlyList<BuocTrinhTuDto>? TrinhTu,
    IReadOnlyList<string>? KetQua,
    IReadOnlyList<CanCuDto>? CanCu,
    int? Tong);

/// <summary>Dữ liệu Trung tâm theo mục được hỏi (F06 BR-9). <see cref="CoDuLieu"/> false: mục chưa có dữ liệu.</summary>
public sealed record ThongTinTrungTamMucDto(
    bool CoDuLieu,
    string? DiaChi,
    string? BanDo,
    IReadOnlyList<GioLamViecDto>? GioLamViec,
    string? GhiChuNgayNghi,
    string? DienThoai,
    string? Email,
    LienKetDto? LienKet);

/// <summary>
/// Đáp án của trợ lý. <see cref="Loai"/> quyết định các trường có nghĩa (plan F06 §3.2); trường khác là null nhưng vẫn có trong JSON.
/// <see cref="ThuTucDangNoi"/>: mã thủ tục để client gửi kèm câu kế tiếp; luôn gán lại bằng giá trị này.
/// </summary>
public sealed record CauTraLoiDto(
    string Loai,
    string? ThuTucDangNoi = null,
    string? Muc = null,
    ThuTucNganDto? ThuTuc = null,
    IReadOnlyList<ThuTucNganDto>? ThuTucKhac = null,
    IReadOnlyList<ThuTucNganDto>? DanhSachThuTuc = null,
    int? Tong = null,
    ChuDeTraLoiDto? ChuDe = null,
    string? TraLoi = null,
    NoiDungMucDto? NoiDung = null,
    ThongTinTrungTamMucDto? ThongTin = null,
    string? LinhVuc = null,
    int? Quay = null,
    string? NoiTiepNhanChuyen = null,
    IReadOnlyList<CanBoDto>? CanBo = null,
    TrungTamNganDto? TrungTam = null,
    LienHeTroLyDto? LienHe = null);
