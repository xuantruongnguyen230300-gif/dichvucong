namespace DichVuCong.Api.Features.ChiTietThuTuc;

/// <summary>
/// Ràng buộc route <c>{ma:maThuTuc}</c>: mã sai định dạng không khớp route nào nên rơi vào 404 chung,
/// trước cả cache và nguồn dữ liệu (không đọc phiên bản dữ liệu, không truy vấn).
/// Dùng chung định dạng với <see cref="ChiTietThuTucService.LaMaHopLe"/> (không dùng <c>regex(...)</c> của route vì nó neo bằng <c>$</c>).
/// </summary>
public sealed class MaThuTucRouteConstraint : IRouteConstraint
{
    public const string Ten = "maThuTuc";

    public bool Match(
        HttpContext? httpContext, IRouter? route, string routeKey, RouteValueDictionary values, RouteDirection routeDirection) =>
        values.TryGetValue(routeKey, out var giaTri) && ChiTietThuTucService.LaMaHopLe(Convert.ToString(giaTri, System.Globalization.CultureInfo.InvariantCulture));
}
