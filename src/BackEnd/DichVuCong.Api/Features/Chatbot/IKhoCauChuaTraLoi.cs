namespace DichVuCong.Api.Features.Chatbot;

/// <summary>
/// Nơi lưu câu hỏi trợ lý chưa trả lời được (F06 BR-7, BR-8, BR-12; plan F00 §9.6). Mỗi nguồn dữ liệu một cài đặt:
/// PostgreSQL (lưu bền) và Mẫu (bộ nhớ, mất khi tắt API).
/// </summary>
public interface IKhoCauChuaTraLoi
{
    /// <summary>
    /// Ghi một câu. <paramref name="noiDung"/> đã che thông tin cá nhân (F06 BR-8), dài tối đa
    /// <see cref="DichVuCong.Data.Entities.CauChuaTraLoi.DoDaiToiDa"/> ký tự, không rỗng.
    /// Gộp theo <c>TiengViet.ChuanHoaTimKiem(noiDung)</c>: đã có thì số lần gặp + 1 và lần gặp cuối = bây giờ
    /// (nội dung giữ nguyên bản đầu); chưa có thì thêm dòng mới, 1 lần gặp.
    /// </summary>
    /// <exception cref="ArgumentOutOfRangeException">Câu dài hơn mức tối đa.</exception>
    /// <exception cref="ArgumentException">Câu rỗng.</exception>
    Task GhiAsync(string noiDung, CancellationToken ct);

    /// <summary>Xoá các dòng có lần gặp cuối trước <paramref name="moc"/> (đúng bằng mốc thì còn giữ); trả số dòng đã xoá.</summary>
    Task<int> XoaQuaHanAsync(DateTimeOffset moc, CancellationToken ct);
}
