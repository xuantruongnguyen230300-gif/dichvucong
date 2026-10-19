using System.ComponentModel.DataAnnotations;
using System.Net;
using Microsoft.AspNetCore.HttpOverrides;

namespace DichVuCong.Api.Common.Hosting;

/// <summary>
/// Mục <c>Hosting:ForwardedHeaders</c>: tin <c>X-Forwarded-For/Proto/Host</c> từ reverse proxy đã khai. Mặc định TẮT (không khai proxy nào).
/// Chỉ nguồn nằm trong <see cref="KnownProxies"/> hoặc <see cref="KnownNetworks"/> (CIDR) được tin; header từ nguồn khác bị bỏ qua.
/// </summary>
public sealed class ForwardedHeadersCauHinh
{
    private const int GioiHanToiDa = 5;

    /// <summary>Địa chỉ IP của proxy tin cậy.</summary>
    public string[] KnownProxies { get; init; } = [];

    /// <summary>Mạng của proxy tin cậy, dạng CIDR (vd. <c>10.0.0.0/24</c>).</summary>
    public string[] KnownNetworks { get; init; } = [];

    /// <summary>Số proxy tối đa được đọc từ chuỗi <c>X-Forwarded-*</c> (số tầng proxy đứng trước API).</summary>
    public int ForwardLimit { get; init; } = 1;

    /// <summary>Bật khi đã khai ít nhất một proxy tin cậy.</summary>
    public bool Bat => KnownProxies.Length > 0 || KnownNetworks.Length > 0;

    internal IEnumerable<ValidationResult> Kiem()
    {
        if (ForwardLimit is < 1 or > GioiHanToiDa)
        {
            yield return new ValidationResult($"Hosting:ForwardedHeaders:ForwardLimit phải từ 1 đến {GioiHanToiDa}.");
        }

        if (KnownProxies.Any(p => !IPAddress.TryParse(p, out _)))
        {
            yield return new ValidationResult("Hosting:ForwardedHeaders:KnownProxies có mục không phải địa chỉ IP.");
        }

        if (KnownNetworks.Any(n => !System.Net.IPNetwork.TryParse(n, out _)))
        {
            yield return new ValidationResult("Hosting:ForwardedHeaders:KnownNetworks có mục không phải CIDR (vd. 10.0.0.0/24).");
        }
    }

    internal void ApDung(ForwardedHeadersOptions options)
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;
        options.ForwardLimit = ForwardLimit;
        // Mặc định của framework tin loopback; ở đây chỉ tin đúng những gì đã khai.
        options.KnownProxies.Clear();
        options.KnownIPNetworks.Clear();
        foreach (var proxy in KnownProxies)
        {
            options.KnownProxies.Add(IPAddress.Parse(proxy));
        }

        foreach (var mang in KnownNetworks)
        {
            options.KnownIPNetworks.Add(System.Net.IPNetwork.Parse(mang));
        }
    }
}
