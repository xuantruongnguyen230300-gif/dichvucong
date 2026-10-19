namespace DichVuCong.Api.Features.DanhMuc;

/// <summary>Một dòng của danh mục rút gọn (plan F04 §3.1): tải một lần, lọc phía trình duyệt. Thuộc tính null vẫn có mặt trong JSON.</summary>
public sealed record ThuTucRutGonDto(
    string Ma,
    string Ten,
    string TenTimKiem,
    string LinhVucMa,
    string MucDo,
    bool CapXa,
    bool CapTinh,
    int? ThuTuThuongGap,
    string? ThoiHan,
    string? CoQuanThucHien);

/// <summary>Lĩnh vực có ít nhất một thủ tục, kèm số thủ tục mỗi cấp (plan F04 §3.1).</summary>
public sealed record LinhVucDto(
    string Ma,
    string Ten,
    string TenTimKiem,
    int SoThuTucXa,
    int SoThuTucTinh);
