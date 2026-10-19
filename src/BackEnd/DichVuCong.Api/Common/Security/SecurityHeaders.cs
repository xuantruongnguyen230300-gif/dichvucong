namespace DichVuCong.Api.Common.Security;

/// <summary>Giá trị header bảo mật — nguồn duy nhất, theo mục Bảo mật của CLAUDE.md.</summary>
public static class SecurityHeaders
{
    public const string ContentSecurityPolicy =
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; " +
        "connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

    public const string StrictTransportSecurity = "max-age=31536000; includeSubDomains";

    public static readonly IReadOnlyDictionary<string, string> Always = new Dictionary<string, string>
    {
        ["Content-Security-Policy"] = ContentSecurityPolicy,
        ["X-Content-Type-Options"] = "nosniff",
        ["Referrer-Policy"] = "strict-origin-when-cross-origin",
        ["Permissions-Policy"] = "microphone=(), camera=(), geolocation=()",
    };
}
