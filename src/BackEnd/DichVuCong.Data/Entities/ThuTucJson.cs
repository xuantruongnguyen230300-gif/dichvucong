namespace DichVuCong.Data.Entities;

// Các kiểu dưới đây lưu trong cột jsonb của thu_tuc (EF complex collection).

public class BuocTrinhTu
{
    public string? TruongHop { get; set; }

    public string NoiDung { get; set; } = string.Empty;
}

public class CachThucNop
{
    public string? HinhThuc { get; set; }

    public string? ThoiHan { get; set; }

    public string? Phi { get; set; }

    public string? MoTa { get; set; }
}

public class GiayTo
{
    public string Ten { get; set; } = string.Empty;

    /// <summary>Null là chưa ghi số bản (nguồn ghi 0 và 0 cũng lưu null).</summary>
    public int? BanChinh { get; set; }

    public int? BanSao { get; set; }
}

public class VanBanCanCu
{
    public string? SoKyHieu { get; set; }

    public string? TrichYeu { get; set; }
}
