using DichVuCong.Api.Features.Chatbot.TimKiem;

namespace DichVuCong.Api.Features.Chatbot;

/// <summary>
/// Một bước trả lời của trợ lý (F06 BR-1). Các bước đăng ký vào DI và chạy lần lượt theo <see cref="ThuTu"/> tăng dần;
/// bước đầu trả về đáp án khác null thì dừng. Thêm bước mới (kể cả bước dùng AI sau này) chỉ cần thêm một lớp cài interface
/// này và đăng ký — không sửa bước cũ.
/// </summary>
internal interface IChatHandler
{
    /// <summary>Thứ tự chạy, nhỏ chạy trước. Bước cuối (không hiểu) luôn trả đáp án.</summary>
    int ThuTu { get; }

    /// <summary>Đáp án của bước này, hoặc null nếu bước này không xử lý câu hỏi.</summary>
    Task<CauTraLoiDto?> XuLyAsync(NguCanhHoi nguCanh, CancellationToken ct);
}

/// <summary>Mọi thứ các bước cần biết về một câu hỏi; tính một lần đầu yêu cầu rồi chỉ đọc.</summary>
internal sealed class NguCanhHoi
{
    public required ChiMucTroLy ChiMuc { get; init; }

    public required CauDaPhanTich PhanTich { get; init; }

    /// <summary>Câu hỏi đã che số và email, để lưu khi không trả lời được.</summary>
    public required string CauChe { get; init; }

    /// <summary>Thủ tục đang nói tới do client gửi kèm; null nếu không có hoặc mã không có trong dữ liệu.</summary>
    public ThuTucChiMuc? ThuTucDangNoi { get; init; }

    public required IReadOnlyList<UngVien> Ung { get; init; }

    public required ChamDiemOptions Opt { get; init; }

    /// <summary>Ứng viên đứng đầu nếu đủ chắc để coi là thủ tục xác định được.</summary>
    public UngVien? UngDauChac => Ung.Count > 0 && Ung[0].DuChac ? Ung[0] : null;

    public string? MaDangNoi => ThuTucDangNoi?.Ma;
}
