using System.Globalization;
using System.Security.Cryptography;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.Net.Http.Headers;

namespace DichVuCong.Api.Common.Caching;

/// <summary>
/// Policy cache của API danh mục: khoá cache gồm phiên bản dữ liệu, ETag = phiên bản + băm ngắn của bản build.
/// <c>DanhMucNotModifiedMiddleware</c> trả 304 khi <c>If-None-Match</c> khớp, trước khi endpoint chạy.
/// </summary>
public sealed class DanhMucCachePolicy(TimeSpan thoiGianGiu) : IOutputCachePolicy
{
    private const string KhoaPhienBan = "phienBan";

    private static readonly string MaBanBuild = DocMaBanBuild();

    /// <summary>ETag của phiên bản dữ liệu hiện tại (gồm mã bản build).</summary>
    public static EntityTagHeaderValue TaoETag(long phienBan) =>
        new($"\"{phienBan.ToString(CultureInfo.InvariantCulture)}-{MaBanBuild}\"");

    /// <summary>
    /// Băm ngắn của mã định danh module (đổi mỗi lần build, đổi khi mã thay đổi). Không dùng phiên bản thông tin của assembly:
    /// nó mang SHA commit, không nên lộ ra header.
    /// </summary>
    private static string DocMaBanBuild()
    {
        var mvid = typeof(DanhMucCachePolicy).Module.ModuleVersionId.ToByteArray();

        return Convert.ToHexStringLower(SHA256.HashData(mvid)).AsSpan(0, 8).ToString();
    }

    public async ValueTask CacheRequestAsync(OutputCacheContext context, CancellationToken cancellationToken)
    {
        var request = context.HttpContext.Request;
        if (!HttpMethods.IsGet(request.Method) && !HttpMethods.IsHead(request.Method))
        {
            return;
        }

        var phienBan = await context.HttpContext.RequestServices
            .GetRequiredService<IPhienBanDuLieu>()
            .LayAsync(cancellationToken);
        var phienBanChuoi = phienBan.ToString(CultureInfo.InvariantCulture);

        // Gắn header trước khi endpoint chạy; chỉ response 200 mới giữ ETag và no-cache.
        var etag = TaoETag(phienBan);
        var response = context.HttpContext.Response;
        response.OnStarting(() =>
        {
            if (response.StatusCode == StatusCodes.Status200OK)
            {
                response.GetTypedHeaders().ETag = etag;
                response.Headers.CacheControl = "no-cache";
            }

            return Task.CompletedTask;
        });
        context.EnableOutputCaching = true;
        context.AllowCacheLookup = true;
        context.AllowCacheStorage = true;
        context.AllowLocking = true;
        context.ResponseExpirationTimeSpan = thoiGianGiu;
        // Chỉ vary theo tham số mà endpoint khai (DanhMucQueryAttribute); không khai thì bỏ qua toàn bộ query.
        var khoaQuery = context.HttpContext.GetEndpoint()?.Metadata.GetMetadata<DanhMucQueryAttribute>()?.Khoa;
        if (khoaQuery is { Count: > 0 })
        {
            context.CacheVaryByRules.QueryKeys = new Microsoft.Extensions.Primitives.StringValues([.. khoaQuery]);
        }
        context.CacheVaryByRules.VaryByValues[KhoaPhienBan] = phienBanChuoi;
    }

    public ValueTask ServeFromCacheAsync(OutputCacheContext context, CancellationToken cancellationToken) =>
        ValueTask.CompletedTask;

    public ValueTask ServeResponseAsync(OutputCacheContext context, CancellationToken cancellationToken)
    {
        if (context.HttpContext.Response.StatusCode != StatusCodes.Status200OK)
        {
            context.AllowCacheStorage = false;
        }

        return ValueTask.CompletedTask;
    }
}
