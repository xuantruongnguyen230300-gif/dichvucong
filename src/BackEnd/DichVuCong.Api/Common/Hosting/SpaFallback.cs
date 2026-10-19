using Microsoft.AspNetCore.Http.Metadata;
using Microsoft.AspNetCore.Routing.Patterns;
using Microsoft.AspNetCore.Routing.Template;
using Microsoft.Net.Http.Headers;

namespace DichVuCong.Api.Common.Hosting;

/// <summary>
/// Fallback về index.html cho route của React. Đường dẫn /api, /health, /swagger và /openapi không bao giờ phục vụ HTML
/// (ngoài Development không có Swagger UI và OpenAPI nên /swagger, /openapi/... là 404 chứ không phải trang React):
/// khớp một route chỉ nhận phương thức khác (vd. GET vào route chỉ có POST) → 405 kèm <c>Allow</c>, còn lại → 404; cả hai là ProblemDetails.
/// Route dự phòng nhận mọi phương thức và mọi đường dẫn (kể cả có dấu chấm) để tự trả 405/415: nếu chỉ nhận GET/HEAD thì routing tự gộp GET, HEAD
/// vào <c>Allow</c> của route khác dù GET cũng 405. Đường dẫn của React chỉ nhận GET, HEAD; phương thức khác (kể cả OPTIONS)
/// → 405 <c>Allow: GET, HEAD</c>, không CORS. Đường dẫn giống tên file (có đuôi) ngoài /api, /health → 404.
/// Chưa có index.html (FE chưa build) → 404, không lỗi.
/// Có <see cref="ITrangHtml"/> thì trang được chèn dữ liệu đặc tả; không thì trả nguyên file.
/// </summary>
internal static class SpaFallback
{
    /// <summary>Mẫu đường dẫn bắt mọi thứ; không dùng <c>nonfile</c> để route sai phương thức/kiểu nội dung có dấu chấm (vd. mã thủ tục) vẫn tới đây.</summary>
    internal const string Pattern = "{*path}";

    public static async Task<IResult> Handle(HttpContext context, IWebHostEnvironment environment, EndpointDataSource endpoints)
    {
        var path = context.Request.Path;
        var isApi = path.StartsWithSegments("/api") || path.StartsWithSegments("/health")
            || path.StartsWithSegments("/swagger") || path.StartsWithSegments("/openapi");
        if (isApi)
        {
            return TraLoiApi(context, endpoints);
        }

        if (Path.HasExtension(path.Value))
        {
            return NotFound();
        }

        if (!HttpMethods.IsGet(context.Request.Method) && !HttpMethods.IsHead(context.Request.Method))
        {
            return PhuongThucKhongHopLe(context, "GET, HEAD");
        }

        var file = environment.WebRootFileProvider.GetFileInfo(StaticAssets.IndexFile);
        if (!file.Exists)
        {
            return NotFound();
        }

        context.Response.Headers.CacheControl = StaticAssets.NoCache;
        var trangHtml = context.RequestServices.GetService<ITrangHtml>();
        if (trangHtml is null)
        {
            return Results.Stream(file.CreateReadStream(), "text/html; charset=utf-8");
        }

        var html = await trangHtml.TaoAsync(context, context.RequestAborted);
        return Results.Content(html, "text/html; charset=utf-8");
    }

    // Phương thức mà các route (không tính endpoint bắt mọi đường dẫn) khớp với đường dẫn này cho phép.
    // Không route nào khớp, hoặc có route nhận chính phương thức của request (vd. tham số không qua được ràng buộc) → 404.
    private static IResult TraLoiApi(HttpContext context, EndpointDataSource endpoints)
    {
        var path = context.Request.Path;
        var choPhep = new SortedSet<string>(StringComparer.Ordinal);
        foreach (var route in endpoints.Endpoints.OfType<RouteEndpoint>())
        {
            if (route.RoutePattern.Parameters.Any(p => p.IsCatchAll) || !Khop(context, route.RoutePattern, path))
            {
                continue;
            }

            var phuongThuc = route.Metadata.GetMetadata<IHttpMethodMetadata>()?.HttpMethods;
            if (phuongThuc is null || phuongThuc.Count == 0
                || phuongThuc.Contains(context.Request.Method, StringComparer.OrdinalIgnoreCase))
            {
                return KieuNoiDungKhongHopLe(context, route) ? Results.StatusCode(StatusCodes.Status415UnsupportedMediaType) : NotFound();
            }

            choPhep.UnionWith(phuongThuc.Select(m => m.ToUpperInvariant()));
        }

        if (choPhep.Count == 0)
        {
            return NotFound();
        }

        return PhuongThucKhongHopLe(context, string.Join(", ", choPhep));
    }

    // Route nhận phương thức này nhưng bị loại vì [Consumes] (kiểu nội dung không khớp): trả 415 như routing mặc định.
    private static bool KieuNoiDungKhongHopLe(HttpContext context, RouteEndpoint route)
    {
        var nhan = route.Metadata.GetMetadata<IAcceptsMetadata>();
        if (nhan is null || nhan.ContentTypes.Count == 0)
        {
            return false;
        }

        var kieu = MediaTypeHeaderValue.TryParse(context.Request.ContentType, out var giaTri) ? giaTri : null;
        return kieu is null || !nhan.ContentTypes.Any(c => MediaTypeHeaderValue.TryParse(c, out var mau) && kieu.IsSubsetOf(mau));
    }

    private static IResult PhuongThucKhongHopLe(HttpContext context, string allow)
    {
        context.Response.Headers.Allow = allow;
        return Results.StatusCode(StatusCodes.Status405MethodNotAllowed);
    }

    // Khớp mẫu đường dẫn và mọi ràng buộc tham số (vd. {ma:maThuTuc}): mã sai định dạng không khớp route nào → 404 với mọi phương thức.
    private static bool Khop(HttpContext context, RoutePattern pattern, PathString path)
    {
        var values = new RouteValueDictionary();
        if (!new TemplateMatcher(new RouteTemplate(pattern), new RouteValueDictionary()).TryMatch(path, values))
        {
            return false;
        }

        var resolver = context.RequestServices.GetRequiredService<IInlineConstraintResolver>();
        foreach (var parameter in pattern.Parameters)
        {
            foreach (var policy in parameter.ParameterPolicies)
            {
                var constraint = policy.ParameterPolicy as IRouteConstraint
                    ?? (policy.Content is null ? null : resolver.ResolveConstraint(policy.Content));
                if (constraint is not null
                    && !constraint.Match(context, route: null, parameter.Name, values, RouteDirection.IncomingRequest))
                {
                    return false;
                }
            }
        }

        return true;
    }

    // Body rỗng: UseStatusCodePages biến thành ProblemDetails có code.
    private static IResult NotFound() => Results.StatusCode(StatusCodes.Status404NotFound);
}
