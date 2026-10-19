namespace DichVuCong.Data.Entities;

/// <summary>Bảng một dòng duy nhất (<see cref="Id"/> luôn bằng 1).</summary>
public class TrungTam
{
    public const short IdDuyNhat = 1;

    public short Id { get; set; } = IdDuyNhat;

    public string Ten { get; set; } = string.Empty;

    public string NguoiChiuTrachNhiem { get; set; } = string.Empty;

    public string? ChucVuNguoiChiuTrachNhiem { get; set; }

    public string? CoQuanChuQuan { get; set; }

    public string DiaChi { get; set; } = string.Empty;

    public string DienThoai { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Xa { get; set; }

    public string? Tinh { get; set; }

    public string? MaDonViCongDvc { get; set; }

    public string? BanDo { get; set; }

    public string? ZaloOa { get; set; }

    public string? Facebook { get; set; }

    public string? YouTube { get; set; }

    public string? TikTok { get; set; }

    public string? GhiChuNgayNghi { get; set; }
}
