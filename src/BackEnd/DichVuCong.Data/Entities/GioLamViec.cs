namespace DichVuCong.Data.Entities;

/// <summary>Chỉ lưu ngày có ít nhất một buổi làm việc. <see cref="Thu"/>: 1 = Thứ Hai ... 7 = Chủ nhật.</summary>
public class GioLamViec
{
    public short Thu { get; set; }

    public TimeOnly? SangTu { get; set; }

    public TimeOnly? SangDen { get; set; }

    public TimeOnly? ChieuTu { get; set; }

    public TimeOnly? ChieuDen { get; set; }
}
