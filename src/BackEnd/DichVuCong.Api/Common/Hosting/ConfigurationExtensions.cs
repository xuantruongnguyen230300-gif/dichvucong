using System.ComponentModel.DataAnnotations;

namespace DichVuCong.Api.Common.Hosting;

public static class ConfigurationExtensions
{
    /// <summary>
    /// Đọc chuỗi kết nối; thiếu thì dừng khởi động, thông báo chỉ nêu tên khoá, không in giá trị.
    /// </summary>
    public static string GetRequiredConnectionString(this IConfiguration configuration, string name)
    {
        var value = configuration.GetConnectionString(name);
        return string.IsNullOrWhiteSpace(value)
            ? throw new InvalidOperationException($"Thiếu cấu hình ConnectionStrings:{name}.")
            : value;
    }

    /// <summary>
    /// Đọc và kiểm hợp lệ một mục cấu hình ngay lúc khởi động; sai thì dừng, thông báo nêu tên mục.
    /// Giá trị chỉ khai ở appsettings.json, không có mặc định trong code.
    /// </summary>
    public static T GetValidatedOptions<T>(this IConfiguration configuration, string section)
        where T : class
    {
        var options = configuration.GetSection(section).Get<T>()
            ?? throw new InvalidOperationException($"Thiếu cấu hình mục {section}.");

        var errors = new List<ValidationResult>();
        if (!Validator.TryValidateObject(options, new ValidationContext(options), errors, validateAllProperties: true))
        {
            var detail = string.Join(" ", errors.Select(e => e.ErrorMessage));
            throw new InvalidOperationException($"Cấu hình mục {section} không hợp lệ. {detail}");
        }

        return options;
    }
}
