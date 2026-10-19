using System.ComponentModel.DataAnnotations;

namespace DichVuCong.Api.Common.Caching;

public sealed class CachingOptions
{
    public const string SectionName = "Caching";

    /// <summary>Thời gian giữ cache của API danh mục.</summary>
    [Range(typeof(TimeSpan), "00:00:01", "1.00:00:00")]
    public TimeSpan DanhMuc { get; init; }

    /// <summary>
    /// Thời gian giữ phiên bản dữ liệu trong bộ nhớ (mặc định 3 giây). Nhập xong, API danh mục thấy dữ liệu mới sau tối đa chừng đó.
    /// 0 = không giữ, mỗi yêu cầu đọc một lần (dùng trong test).
    /// </summary>
    [Range(typeof(TimeSpan), "00:00:00", "00:05:00")]
    public TimeSpan PhienBanDuLieu { get; init; } = TimeSpan.FromSeconds(3);

    /// <summary>Thời gian giữ dữ liệu đặc tả chèn vào HTML trong bộ nhớ (F08 plan B12).</summary>
    [Range(typeof(TimeSpan), "00:00:01", "01:00:00")]
    public TimeSpan DacTaTrang { get; init; }
}
