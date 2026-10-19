using System.ComponentModel.DataAnnotations;

namespace DichVuCong.Api.Features.Chatbot.TimKiem;

/// <summary>
/// Ngưỡng điểm và tham số sửa lỗi gõ của trợ lý (plan F06 §4.9), mục cấu hình <see cref="TenMuc"/>.
/// Giá trị mặc định là giá trị đã hiệu chỉnh bằng bộ thử 42 câu của plan §9; đổi bằng cấu hình, không sửa mã.
/// Số lượng phần tử tối đa của từng loại đáp án là cấu trúc đáp án, nằm cạnh mã dựng đáp án.
/// </summary>
public sealed class ChamDiemOptions
{
    public const string TenMuc = "Chatbot:ChamDiem";

    /// <summary>Phần trọng số của một từ đã sửa lỗi gõ được tính vào tử số.</summary>
    [Range(0.0, 1.0)]
    public double HeSoTuSuaLoi { get; init; } = 0.5;

    /// <summary>Từ ngắn hơn mức này không sửa lỗi (quá ít chữ để đoán).</summary>
    [Range(1, 20)]
    public int DoDaiToiThieuDeSuaLoi { get; init; } = 4;

    /// <summary>Từ ngắn hơn mức này không được sửa bằng cách bỏ bớt một chữ ("vang" không thành "van"): từ ngắn bỏ chữ thì quá dễ ra từ khác.</summary>
    [Range(1, 20)]
    public int DoDaiToiThieuDeSuaBangXoaChu { get; init; } = 5;

    /// <summary>Từ dài từ mức này trở lên được sửa tới <see cref="SoPhepSuaTuDai"/> phép.</summary>
    [Range(1, 40)]
    public int DoDaiTuDai { get; init; } = 8;

    [Range(0, 3)]
    public int SoPhepSuaTuNgan { get; init; } = 1;

    [Range(0, 3)]
    public int SoPhepSuaTuDai { get; init; } = 2;

    /// <summary>Độ phủ truy vấn tối thiểu để thủ tục được liệt kê ở bước 4.</summary>
    [Range(0.0, 1.0)]
    public double NguongLienQuanPhu { get; init; } = 0.6;

    /// <summary>Độ phủ truy vấn tối thiểu để thủ tục được coi là xác định được (bước 3).</summary>
    [Range(0.0, 1.0)]
    public double NguongChacPhu { get; init; } = 0.7;

    /// <summary>Hệ số Dice tối thiểu để thủ tục được coi là xác định được (bước 3).</summary>
    [Range(0.0, 1.0)]
    public double NguongChacDice { get; init; } = 0.45;

    /// <summary>Hệ số Dice tối thiểu để một cách hỏi mẫu khớp (bước 2).</summary>
    [Range(0.0, 1.0)]
    public double NguongMauDice { get; init; } = 0.7;
}
