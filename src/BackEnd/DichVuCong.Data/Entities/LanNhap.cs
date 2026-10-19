namespace DichVuCong.Data.Entities;

public class LanNhap
{
    public const string ThuTuc = "thu-tuc";
    public const string PhanCong = "phan-cong";
    public const string TrungTam = "trung-tam";
    public const string TroLy = "tro-ly";

    /// <summary>Một trong bốn hằng ở trên.</summary>
    public string Loai { get; set; } = string.Empty;

    public DateTimeOffset ThoiDiem { get; set; }

    /// <summary>Chỉ tên file, không có đường dẫn.</summary>
    public string TenFile { get; set; } = string.Empty;
}
