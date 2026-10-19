using System.ComponentModel.DataAnnotations;
using DichVuCong.Data.DuLieu;

namespace DichVuCong.Api.Common.Hosting;

/// <summary>
/// Mục cấu hình <c>DuLieu</c>: nguồn dữ liệu của API (F00 plan §9.2, BR-16).
/// <c>appsettings.json</c> không có mục này: môi trường triển khai phải khai (<c>DuLieu__Nguon</c>), thiếu thì không khởi động.
/// </summary>
public sealed class DuLieuOptions
{
    public const string SectionName = "DuLieu";

    private const string ThongBao =
        $"Cấu hình {SectionName}:Nguon phải khai và nhận đúng một trong hai giá trị: {nameof(LoaiNguonDuLieu.Mau)}, "
        + $"{nameof(LoaiNguonDuLieu.PostgreSql)} (phân biệt hoa thường).";

    [Required(ErrorMessage = ThongBao)]
    [AllowedValues(nameof(LoaiNguonDuLieu.Mau), nameof(LoaiNguonDuLieu.PostgreSql), ErrorMessage = ThongBao)]
    public string? Nguon { get; init; }

    /// <summary>Đọc và kiểm mục <c>DuLieu</c>. Sai thì ném, thông báo nêu <c>DuLieu:Nguon</c> và hai giá trị hợp lệ, không chép giá trị đã khai.</summary>
    /// <exception cref="InvalidOperationException">Thiếu hoặc sai <c>DuLieu:Nguon</c>.</exception>
    public static LoaiNguonDuLieu DocNguon(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        // Không dùng GetValidatedOptions: mục thiếu hẳn cũng phải báo đúng tên khoá DuLieu:Nguon.
        var options = new DuLieuOptions { Nguon = configuration[$"{SectionName}:Nguon"] };
        var results = new List<ValidationResult>();
        if (!Validator.TryValidateObject(options, new ValidationContext(options), results, validateAllProperties: true))
        {
            throw new InvalidOperationException(results[0].ErrorMessage ?? ThongBao);
        }

        return Enum.Parse<LoaiNguonDuLieu>(options.Nguon!);
    }
}
