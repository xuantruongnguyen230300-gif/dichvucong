using Microsoft.AspNetCore.OutputCaching;
using Microsoft.Net.Http.Headers;

namespace DichVuCong.Api.Common.Caching;

/// <summary>
/// Endpoint gắn policy danh-muc: <c>If-None-Match</c> khớp ETag hiện tại thì trả 304, endpoint không chạy.
/// Đứng ngay trước output cache.
/// </summary>
public sealed class DanhMucNotModifiedMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var request = context.Request;
        if ((HttpMethods.IsGet(request.Method) || HttpMethods.IsHead(request.Method))
            && request.Headers.ContainsKey(HeaderNames.IfNoneMatch)
            && DungPolicyDanhMuc(context))
        {
            var phienBan = await context.RequestServices
                .GetRequiredService<IPhienBanDuLieu>()
                .LayAsync(context.RequestAborted);
            var etag = DanhMucCachePolicy.TaoETag(phienBan);

            if (request.GetTypedHeaders().IfNoneMatch.Any(e => e.Compare(etag, useStrongComparison: false)
                || e.Equals(EntityTagHeaderValue.Any)))
            {
                var response = context.Response;
                response.StatusCode = StatusCodes.Status304NotModified;
                response.GetTypedHeaders().ETag = etag;
                response.Headers.CacheControl = "no-cache";
                return;
            }
        }

        await next(context);
    }

    private static bool DungPolicyDanhMuc(HttpContext context) =>
        context.GetEndpoint()?.Metadata.GetOrderedMetadata<OutputCacheAttribute>()
            .Any(a => a.PolicyName == CachePolicies.DanhMuc) == true;
}
