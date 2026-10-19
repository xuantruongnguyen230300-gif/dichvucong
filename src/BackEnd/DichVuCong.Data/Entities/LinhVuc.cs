using System.Text.Json.Serialization;

namespace DichVuCong.Data.Entities;

public class LinhVuc
{
    /// <summary>Mã sinh từ tên bằng <c>TiengViet.TaoMaDuongDan</c>, ví dụ <c>ho-tich</c>.</summary>
    public string Ma { get; set; } = string.Empty;

    public string Ten { get; set; } = string.Empty;

    public string TenTimKiem { get; set; } = string.Empty;

    /// <summary>Không có trong file dữ liệu mẫu; <c>TepDuLieuMau</c> nối lại sau khi đọc.</summary>
    [JsonIgnore]
    public List<ThuTuc> ThuTucs { get; } = [];
}
