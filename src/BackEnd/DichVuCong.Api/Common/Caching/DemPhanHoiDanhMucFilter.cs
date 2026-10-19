using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.OutputCaching;

namespace DichVuCong.Api.Common.Caching;

/// <summary>
/// Endpoint gắn policy danh-muc: gom thân response vào bộ nhớ rồi ghi một lần. Lần lỡ cache, bộ định dạng JSON ghi từng khúc
/// kèm Flush; nén (Brotli/Gzip) bị ép đóng khối sau mỗi Flush nên lần trả đầu lớn gấp 2–4 lần lần sau
/// (<c>/api/thu-tuc</c> 71 KB so với 37 KB). Ghi một lần thì lần lỡ cache nén giống lần trúng cache.
/// Thân tối đa vài trăm KB (danh mục ~1.000 thủ tục), nên giữ trong bộ nhớ là chấp nhận được.
/// </summary>
public sealed class DemPhanHoiDanhMucFilter : IAsyncResultFilter
{
    public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        var http = context.HttpContext;
        var dungPolicy = context.ActionDescriptor.EndpointMetadata.OfType<OutputCacheAttribute>()
            .Any(a => a.PolicyName == CachePolicies.DanhMuc);
        if (!dungPolicy || HttpMethods.IsHead(http.Request.Method))
        {
            await next();
            return;
        }

        var goc = http.Response.Body;
        using var dem = new MemoryStream();
        http.Response.Body = dem;
        try
        {
            await next();
        }
        finally
        {
            http.Response.Body = goc;
        }

        if (dem.Length > 0)
        {
            await goc.WriteAsync(dem.GetBuffer().AsMemory(0, (int)dem.Length), http.RequestAborted);
        }
    }
}
