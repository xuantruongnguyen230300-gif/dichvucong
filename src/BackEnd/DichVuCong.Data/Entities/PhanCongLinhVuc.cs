namespace DichVuCong.Data.Entities;

/// <summary>Nối với <see cref="LinhVuc"/> theo mã, không có khoá ngoại: nhập phân công không đụng tới dữ liệu thủ tục.</summary>
public class PhanCongLinhVuc
{
    public string LinhVucMa { get; set; } = string.Empty;

    public string TenLinhVuc { get; set; } = string.Empty;

    public int? Quay { get; set; }

    public string? NoiTiepNhanChuyen { get; set; }
}
