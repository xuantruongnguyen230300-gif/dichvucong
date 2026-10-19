using System.Text.Json.Serialization;

namespace DichVuCong.Data.Entities;

/// <summary><see cref="ThuTu"/> 1 là câu hỏi chính, từ 2 là các cách hỏi khác.</summary>
public class CauHoiMauCachHoi
{
    /// <summary>Không có trong file dữ liệu mẫu (cách hỏi nằm trong câu hỏi mẫu); <c>TepDuLieuMau</c> đặt lại sau khi đọc.</summary>
    [JsonIgnore]
    public int CauHoiMauThuTu { get; set; }

    public int ThuTu { get; set; }

    public string NoiDung { get; set; } = string.Empty;

    public string NoiDungTimKiem { get; set; } = string.Empty;

    [JsonIgnore]
    public CauHoiMau? CauHoiMau { get; set; }
}
