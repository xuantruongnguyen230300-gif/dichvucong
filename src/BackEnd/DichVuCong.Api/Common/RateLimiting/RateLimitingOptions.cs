using System.ComponentModel.DataAnnotations;

namespace DichVuCong.Api.Common.RateLimiting;

public sealed class RateLimitingOptions
{
    public const string SectionName = "RateLimiting";

    /// <summary>Số yêu cầu / phút / IP cho API danh mục.</summary>
    [Range(1, 100_000)]
    public int DanhMuc { get; init; }

    /// <summary>Số yêu cầu / phút / IP cho API trợ lý.</summary>
    [Range(1, 100_000)]
    public int TroLy { get; init; }
}
