using System.Globalization;
using DichVuCong.Import.Resources;

namespace DichVuCong.Import.Lenh;

/// <summary>Phân tích dòng lệnh (plan F01 §5.1). Không dùng thư viện ngoài: chỉ có vài lệnh.</summary>
public static class PhanTichLenh
{
    private const string CoChiKiem = "--chi-kiem";

    private static readonly Dictionary<string, LoaiNhap> LoaiTheoTen = new(StringComparer.Ordinal)
    {
        ["thu-tuc"] = LoaiNhap.ThuTuc,
        ["phan-cong"] = LoaiNhap.PhanCong,
        ["trung-tam"] = LoaiNhap.TrungTam,
        ["tro-ly"] = LoaiNhap.TroLy,
        ["tat-ca"] = LoaiNhap.TatCa,
    };

    /// <summary>Trả về lệnh, hoặc thông báo lỗi bằng tiếng Việt khi dòng lệnh sai.</summary>
    public static (LenhDaPhanTich? Lenh, string? Loi) PhanTich(string[] args)
    {
        ArgumentNullException.ThrowIfNull(args);

        if (args.Length == 0 || args[0] is "help" or "--help" or "-h" or "-?")
        {
            return (new LenhHuongDan(), null);
        }

        var ten = args[0];
        var thamSo = args.Skip(1).Where(a => a != CoChiKiem).ToArray();
        var chiKiem = args.Length - 1 != thamSo.Length;

        return ten switch
        {
            "nhap" => PhanTichNhap(thamSo, chiKiem),
            "xuat" => PhanTichXuat(thamSo, chiKiem),
            "tao-mau" => PhanTichTaoMau(thamSo, chiKiem),
            _ => Loi(ThongBao.LoiLenhLa, ten),
        };
    }

    private static (LenhDaPhanTich?, string?) PhanTichNhap(string[] thamSo, bool chiKiem)
    {
        if (thamSo.Length < 2)
        {
            return Loi(ThongBao.LoiThieuThamSo, "nhap");
        }

        if (!LoaiTheoTen.TryGetValue(thamSo[0], out var loai))
        {
            return Loi(ThongBao.LoiLoaiDuLieu, thamSo[0]);
        }

        return thamSo.Length > 2
            ? Loi(ThongBao.LoiThamSoThua, thamSo[2])
            : (new LenhNhap(loai, thamSo[1], chiKiem), null);
    }

    private static (LenhDaPhanTich?, string?) PhanTichXuat(string[] thamSo, bool chiKiem)
    {
        if (chiKiem)
        {
            return Loi(ThongBao.LoiThamSoThua, CoChiKiem);
        }

        if (thamSo.Length < 2)
        {
            return Loi(ThongBao.LoiThieuThamSo, "xuat");
        }

        if (thamSo[0] != "cau-chua-tra-loi")
        {
            return Loi(ThongBao.LoiThamSoThua, thamSo[0]);
        }

        return thamSo.Length > 2
            ? Loi(ThongBao.LoiThamSoThua, thamSo[2])
            : (new LenhXuat(thamSo[1]), null);
    }

    private static (LenhDaPhanTich?, string?) PhanTichTaoMau(string[] thamSo, bool chiKiem)
    {
        if (chiKiem)
        {
            return Loi(ThongBao.LoiThamSoThua, CoChiKiem);
        }

        if (thamSo.Length < 1)
        {
            return Loi(ThongBao.LoiThieuThamSo, "tao-mau");
        }

        return thamSo.Length > 1
            ? Loi(ThongBao.LoiThamSoThua, thamSo[1])
            : (new LenhTaoMau(thamSo[0]), null);
    }

    private static (LenhDaPhanTich?, string?) Loi(string mau, string giaTri)
        => (null, string.Format(CultureInfo.CurrentCulture, mau, giaTri));
}
