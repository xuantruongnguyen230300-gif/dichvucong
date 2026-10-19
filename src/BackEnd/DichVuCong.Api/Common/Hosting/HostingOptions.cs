using System.ComponentModel.DataAnnotations;

namespace DichVuCong.Api.Common.Hosting;

public sealed class HostingOptions : IValidatableObject
{
    public const string SectionName = "Hosting";

    /// <summary>Giới hạn kích thước body request (byte).</summary>
    [Range(1, 10_000_000)]
    public long MaxRequestBodyBytes { get; init; }

    /// <summary>Thời gian tối đa cho bước kiểm DB của /health/ready.</summary>
    [Range(typeof(TimeSpan), "00:00:00.100", "00:01:00")]
    public TimeSpan ReadyTimeout { get; init; }

    /// <summary>Tin header X-Forwarded-* từ reverse proxy đã khai; mặc định tắt.</summary>
    public ForwardedHeadersCauHinh ForwardedHeaders { get; init; } = new();

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext) => ForwardedHeaders.Kiem();
}
