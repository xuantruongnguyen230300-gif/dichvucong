namespace DichVuCong.Data.Entities;

public class CauChuaTraLoi
{
    /// <summary>Thời gian giữ kể từ lần gặp cuối (F06 BR-12). Nguồn duy nhất cho việc xoá định kỳ ở API và lệnh xuất ở Import.</summary>
    public static readonly TimeSpan ThoiGianGiu = TimeSpan.FromDays(90);

    /// <summary>Số ký tự tối đa của <see cref="NoiDung"/>.</summary>
    public const int DoDaiToiDa = 500;

    public long Id { get; set; }

    /// <summary>Câu đã che thông tin cá nhân.</summary>
    public string NoiDung { get; set; } = string.Empty;

    /// <summary>Bằng <c>TiengViet.ChuanHoaTimKiem(NoiDung)</c>; khoá gộp các câu giống nhau.</summary>
    public string KhoaGop { get; set; } = string.Empty;

    public int SoLanGap { get; set; } = 1;

    public DateTimeOffset LanGapCuoi { get; set; }
}
