namespace DichVuCong.Import.Lenh;

/// <summary>Chuyển lệnh đã phân tích tới phần cài đặt tương ứng.</summary>
internal static class ChayLenh
{
    public static Task<int> ChayAsync(
        LenhDaPhanTich lenh,
        IServiceProvider dichVu,
        TextWriter ra,
        TextWriter loi,
        CancellationToken huy)
    {
        ArgumentNullException.ThrowIfNull(lenh);
        ArgumentNullException.ThrowIfNull(dichVu);
        ArgumentNullException.ThrowIfNull(ra);
        ArgumentNullException.ThrowIfNull(loi);
        huy.ThrowIfCancellationRequested();

        return lenh switch
        {
            LenhNhap nhap => NhapDuLieu.ChayAsync(nhap, dichVu, ra, loi, huy),
            LenhXuat xuat => XuatDuLieu.ChayAsync(xuat, dichVu, ra, loi, huy),
            LenhTaoMau taoMau => TaoMauFile.ChayAsync(taoMau, ra, loi),
            _ => throw new ArgumentOutOfRangeException(nameof(lenh)),
        };
    }
}
