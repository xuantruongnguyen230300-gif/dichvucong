namespace DichVuCong.Api.Features.ChiTietThuTuc;

/// <summary>Chi tiết một thủ tục cho popup (plan F03 §3.1). Chỉ trường màn hình dùng; thuộc tính null vẫn có mặt trong JSON.</summary>
public sealed record ChiTietThuTucDto(
    string Ma,
    string Ten,
    string LinhVuc,
    string MucDo,
    string? CoQuanThucHien,
    string? ThoiHan,
    string? Phi,
    IReadOnlyList<string> HinhThucNop,
    string? YeuCauDieuKien,
    IReadOnlyList<BuocTrinhTuDto> TrinhTu,
    IReadOnlyList<CachThucNopDto> CachThuc,
    IReadOnlyList<GiayToDto> ThanhPhanHoSo,
    IReadOnlyList<string> KetQua,
    IReadOnlyList<CanCuDto> CanCu);

public sealed record BuocTrinhTuDto(string? TruongHop, string NoiDung);

public sealed record CachThucNopDto(string? HinhThuc, string? ThoiHan, string? Phi, string? MoTa);

/// <summary>Cả hai số null là chưa ghi số bản (F01 Q10).</summary>
public sealed record GiayToDto(string Ten, int? BanChinh, int? BanSao);

/// <summary>Chỉ chữ, không có liên kết.</summary>
public sealed record CanCuDto(string? SoKyHieu, string? TrichYeu);
