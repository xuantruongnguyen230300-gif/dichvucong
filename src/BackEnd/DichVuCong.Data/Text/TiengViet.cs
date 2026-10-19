using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace DichVuCong.Data.Text;

/// <summary>
/// Chuẩn hoá tiếng Việt cho tìm kiếm. Bản FE (core/utils/tiengViet.ts) phải cho cùng kết quả.
/// </summary>
public static partial class TiengViet
{
    /// <summary>NFD, bỏ dấu kết hợp, đ/Đ thành d/D, trả về NFC. Giữ nguyên hoa/thường và khoảng trắng.</summary>
    public static string BoDau(string chuoi)
    {
        ArgumentNullException.ThrowIfNull(chuoi);

        var phanRa = chuoi.Normalize(NormalizationForm.FormD);
        var ketQua = new StringBuilder(phanRa.Length);

        foreach (var kyTu in phanRa)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(kyTu) == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            ketQua.Append(kyTu switch
            {
                'đ' => 'd',
                'Đ' => 'D',
                _ => kyTu,
            });
        }

        return ketQua.ToString().Normalize(NormalizationForm.FormC);
    }

    /// <summary>
    /// Bỏ ký tự vô hình U+200B–U+200F (gồm dấu định hướng chữ U+200E, U+200F) và U+FEFF.
    /// Dùng để làm sạch chữ khi nhập và trong <see cref="ChuanHoaTimKiem"/>.
    /// </summary>
    public static string BoKyTuVoHinh(string chuoi)
    {
        ArgumentNullException.ThrowIfNull(chuoi);
        return KyTuVoHinh().Replace(chuoi, string.Empty);
    }

    /// <summary>BoDau, chữ thường (invariant), bỏ ký tự vô hình, gộp khoảng trắng, trim.</summary>
    public static string ChuanHoaTimKiem(string chuoi)
    {
        var khongDau = BoDau(chuoi).ToLowerInvariant();
        var khongVoHinh = BoKyTuVoHinh(khongDau);
        return KhoangTrang().Replace(khongVoHinh, " ").Trim();
    }

    /// <summary>
    /// Mã dùng trên địa chỉ trang: <see cref="ChuanHoaTimKiem"/>, mỗi chuỗi ký tự ngoài a-z, 0-9 thành một dấu gạch ngang,
    /// bỏ gạch ngang ở đầu và cuối. Trả về chuỗi rỗng nếu không có chữ hay số nào.
    /// </summary>
    public static string TaoMaDuongDan(string chuoi)
        => KhongPhaiChuSo().Replace(ChuanHoaTimKiem(chuoi), "-").Trim('-');

    // Tập ký tự phải khớp với bản FE: bỏ U+200B–U+200F, U+FEFF; khoảng trắng gồm cả U+0085.
    [GeneratedRegex("[\u200B-\u200F\uFEFF]")]
    private static partial Regex KyTuVoHinh();

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex KhongPhaiChuSo();

    [GeneratedRegex(@"\s+")]
    private static partial Regex KhoangTrang();
}
