using System.Text;
using System.Text.RegularExpressions;

namespace DichVuCong.Api.Features.ChiTietThuTuc;

/// <summary>
/// Chọn thời hạn giải quyết "rõ ràng" của thủ tục (plan F03 §3.1). Dữ liệu nguồn có 77/408 thủ tục chỉ ghi "Khác" hoặc "1 Khác"
/// — không phải một thời hạn. Hàm thuần, chạy trong C# sau khi đã lấy dữ liệu (không đặt trong biểu thức LINQ — plan F00 §9.4 R4).
/// Dùng chung cho chi tiết thủ tục (F03) và danh mục rút gọn (F04).
/// </summary>
public static partial class ThoiHanThuTuc
{
    /// <summary>
    /// <paramref name="thoiHan"/> nếu là một thời hạn thật, ngược lại <c>null</c>: rỗng, toàn khoảng trắng,
    /// hoặc chỉ là "Khác" (có thể kèm số đứng trước, không phân biệt hoa thường, có dấu hay không dấu).
    /// </summary>
    public static string? LamRo(string? thoiHan)
    {
        if (string.IsNullOrWhiteSpace(thoiHan))
        {
            return null;
        }

        // Dạng NFD (dấu tách rời) vẫn phải nhận ra là "Khác".
        var chuan = thoiHan.IsNormalized(NormalizationForm.FormC) ? thoiHan : thoiHan.Normalize(NormalizationForm.FormC);

        return ChiLaKhac().IsMatch(chuan) ? null : thoiHan;
    }

    /// <summary>
    /// Thời hạn của thủ tục nếu rõ ràng; không thì thời hạn rõ ràng đầu tiên trong các cách thức nộp; không có thì <c>null</c>.
    /// </summary>
    public static string? Chon(string? thoiHan, IEnumerable<string?> thoiHanCacCachThuc)
    {
        ArgumentNullException.ThrowIfNull(thoiHanCacCachThuc);

        var rieng = LamRo(thoiHan);
        if (rieng is not null)
        {
            return rieng;
        }

        foreach (var cachThuc in thoiHanCacCachThuc)
        {
            var ro = LamRo(cachThuc);
            if (ro is not null)
            {
                return ro;
            }
        }

        return null;
    }

    // Có thời gian chờ để chuỗi dài bất thường (thời hạn tối đa khoảng 1.200 ký tự) không làm treo yêu cầu.
    [GeneratedRegex(@"^\s*(\d+\s*)?(khác|khac)\s*\z", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant, matchTimeoutMilliseconds: 200)]
    private static partial Regex ChiLaKhac();
}
