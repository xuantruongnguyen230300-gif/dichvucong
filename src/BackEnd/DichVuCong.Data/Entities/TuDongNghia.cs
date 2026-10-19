namespace DichVuCong.Data.Entities;

public class TuDongNghia
{
    public int ThuTu { get; set; }

    public string Tu { get; set; } = string.Empty;

    public string TuTimKiem { get; set; } = string.Empty;

    public string[] CachNoiKhac { get; set; } = [];
}
