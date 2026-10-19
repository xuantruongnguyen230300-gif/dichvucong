using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Diagnostics;

namespace DichVuCong.Api.Common.Errors;

/// <summary>
/// Chuỗi mô tả yêu cầu để ghi nhật ký. Không bao giờ ghi đường dẫn client gửi: đường dẫn có thể mang dữ liệu cá nhân
/// (vd. <c>/api/thu-tuc/0912345678</c>), và 4xx là thứ kẻ gửi bừa gây ra được nhiều nhất.
/// </summary>
public static partial class NhatKy
{
    /// <summary>Không khớp route nào (404): chỉ ghi phương thức và chuỗi này.</summary>
    public const string RouteKhongTonTai = "route-khong-ton-tai";

    /// <summary>Lỗi xảy ra trước khi định tuyến (vd. 413, 400 Host): chưa biết route.</summary>
    public const string RouteChuaXacDinh = "route-chua-xac-dinh";

    /// <summary>
    /// Mẫu route của endpoint đã khớp (vd. <c>/api/thu-tuc/{ma}</c>), không kèm giá trị tham số và query.
    /// Endpoint bắt mọi đường dẫn (fallback) coi như không khớp route nào.
    /// </summary>
    public static string MauDuongDan(HttpContext context, int maHttp)
    {
        ArgumentNullException.ThrowIfNull(context);

        // Exception handler gỡ endpoint khỏi context trước khi chạy; bản gốc nằm ở feature của nó.
        var endpoint = context.Features.Get<IExceptionHandlerFeature>()?.Endpoint ?? context.GetEndpoint();
        if (endpoint is RouteEndpoint route)
        {
            if (route.RoutePattern.Parameters.Any(p => p.IsCatchAll))
            {
                return RouteKhongTonTai;
            }

            var mau = route.RoutePattern.RawText;
            if (!string.IsNullOrEmpty(mau))
            {
                // Bỏ ràng buộc và giá trị mặc định trong dấu ngoặc: {ma:maThuTuc} -> {ma}.
                mau = RangBuocThamSo().Replace(mau, "{$1$2}");
                return mau[0] == '/' ? mau : "/" + mau;
            }
        }

        return endpoint is null && maHttp == StatusCodes.Status404NotFound ? RouteKhongTonTai : RouteChuaXacDinh;
    }

    [GeneratedRegex(@"\{(\*{0,2})([^}:=?]+)[^}]*\}", RegexOptions.CultureInvariant, matchTimeoutMilliseconds: 100)]
    private static partial Regex RangBuocThamSo();
}
