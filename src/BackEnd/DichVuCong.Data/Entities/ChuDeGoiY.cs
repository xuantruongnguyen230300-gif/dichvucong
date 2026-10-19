namespace DichVuCong.Data.Entities;

/// <summary>Nối với <see cref="LinhVuc"/> theo mã, không có khoá ngoại.</summary>
public class ChuDeGoiY
{
    public int ThuTu { get; set; }

    public string TenHienThi { get; set; } = string.Empty;

    public string TenLinhVuc { get; set; } = string.Empty;

    public string LinhVucMa { get; set; } = string.Empty;
}
