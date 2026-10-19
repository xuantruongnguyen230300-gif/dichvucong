using System.Net;
using System.Net.Sockets;

namespace DichVuCong.Api.Common.RateLimiting;

/// <summary>
/// Khoá bộ đếm giới hạn theo địa chỉ máy gọi. IPv4 giữ nguyên; IPv6 gộp theo tiền tố /64 (một máy thường được cấp cả /64
/// nên đổi địa chỉ trong /64 không được lách giới hạn); địa chỉ IPv4-mapped IPv6 (<c>::ffff:a.b.c.d</c>) coi là IPv4.
/// </summary>
public static class KhoaGioiHan
{
    public const string KhongBiet = "unknown";

    private const int ByteTienToIPv6 = 8;

    public static string TuIp(IPAddress? ip)
    {
        if (ip is null)
        {
            return KhongBiet;
        }

        if (ip.IsIPv4MappedToIPv6)
        {
            ip = ip.MapToIPv4();
        }

        if (ip.AddressFamily != AddressFamily.InterNetworkV6)
        {
            return ip.ToString();
        }

        Span<byte> byteIp = stackalloc byte[16];
        if (!ip.TryWriteBytes(byteIp, out _))
        {
            return KhongBiet;
        }

        byteIp[ByteTienToIPv6..].Clear();

        return $"{new IPAddress(byteIp)}/64";
    }
}
