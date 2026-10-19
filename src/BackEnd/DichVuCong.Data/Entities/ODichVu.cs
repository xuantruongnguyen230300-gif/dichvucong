namespace DichVuCong.Data.Entities;

public class ODichVu
{
    public int ThuTu { get; set; }

    public string Ten { get; set; } = string.Empty;

    public string? MoTa { get; set; }

    public string BieuTuong { get; set; } = string.Empty;

    /// <summary>Null là chưa có link: ô vẫn hiện nhưng không bấm được.</summary>
    public string? Url { get; set; }
}
