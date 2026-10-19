using System.Globalization;
using DichVuCong.Import.Lenh;
using DichVuCong.Import.Resources;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Import;

/// <summary>Điểm vào của công cụ nhập; test gọi trực tiếp, không qua tiến trình.</summary>
public static class UngDung
{
    public const string KhoaChuoiKetNoi = "ConnectionStrings:DichVuCong";

    /// <summary>Chạy một lệnh và trả mã thoát (<see cref="MaThoat"/>).</summary>
    public static async Task<int> ChayAsync(
        string[] args,
        IServiceProvider dichVu,
        TextWriter ra,
        TextWriter loi,
        CancellationToken huy = default)
    {
        ArgumentNullException.ThrowIfNull(args);
        ArgumentNullException.ThrowIfNull(dichVu);
        ArgumentNullException.ThrowIfNull(ra);
        ArgumentNullException.ThrowIfNull(loi);

        var (lenh, thongBaoLoi) = PhanTichLenh.PhanTich(args);

        if (lenh is null)
        {
            await loi.WriteLineAsync(thongBaoLoi);
            return (int)MaThoat.SaiLenh;
        }

        if (lenh is LenhHuongDan)
        {
            await ra.WriteLineAsync(ThongBao.HuongDan);
            return (int)MaThoat.ThanhCong;
        }

        if (CanCoSoDuLieu(lenh)
            && string.IsNullOrWhiteSpace(dichVu.GetService<IConfiguration>()?.GetValue<string>(KhoaChuoiKetNoi)))
        {
            await loi.WriteLineAsync(string.Format(CultureInfo.CurrentCulture, ThongBao.LoiThieuChuoiKetNoi, KhoaChuoiKetNoi));
            return (int)MaThoat.LoiHeThong;
        }

        return await ChayLenh.ChayAsync(lenh, dichVu, ra, loi, huy);
    }

    // tao-mau chỉ ghi file; nhap --chi-kiem thu-tuc/phan-cong/trung-tam/tat-ca chỉ đọc file.
    // Chỉ nhap tro-ly --chi-kiem chạy riêng cần dữ liệu trong DB để kiểm (quyết định bổ sung 2026-10-08, plan F01 §5.1).
    private static bool CanCoSoDuLieu(LenhDaPhanTich lenh) => lenh switch
    {
        LenhTaoMau => false,
        LenhNhap { ChiKiem: true, Loai: LoaiNhap.ThuTuc or LoaiNhap.PhanCong or LoaiNhap.TrungTam or LoaiNhap.TatCa } => false,
        _ => true,
    };
}
