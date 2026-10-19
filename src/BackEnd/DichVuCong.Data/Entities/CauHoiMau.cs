namespace DichVuCong.Data.Entities;

/// <summary>Có <see cref="TraLoi"/> hoặc <see cref="MucTrungTam"/>, đúng một trong hai (CHECK ở DB).</summary>
public class CauHoiMau
{
    public int ThuTu { get; set; }

    public string CauHoi { get; set; } = string.Empty;

    public string? TraLoi { get; set; }

    public MucTrungTam? MucTrungTam { get; set; }

    public string[] MaThuTuc { get; set; } = [];

    public List<CauHoiMauCachHoi> CachHoi { get; } = [];
}
