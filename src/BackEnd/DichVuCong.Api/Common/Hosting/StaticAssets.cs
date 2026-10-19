using Microsoft.AspNetCore.StaticFiles;

namespace DichVuCong.Api.Common.Hosting;

/// <summary>Quy tắc cache cho file tĩnh: index.html không cache, file có hash trong /assets cache 1 năm.</summary>
internal static class StaticAssets
{
    public const string IndexFile = "index.html";
    public const string NoCache = "no-cache";
    private const string Immutable = "public,max-age=31536000,immutable";

    public static void SetCacheControl(StaticFileResponseContext context)
    {
        var response = context.Context.Response;
        if (string.Equals(context.File.Name, IndexFile, StringComparison.OrdinalIgnoreCase))
        {
            response.Headers.CacheControl = NoCache;
        }
        else if (context.Context.Request.Path.StartsWithSegments("/assets"))
        {
            response.Headers.CacheControl = Immutable;
        }
    }
}
