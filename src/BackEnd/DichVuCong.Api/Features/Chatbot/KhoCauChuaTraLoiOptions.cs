using System.ComponentModel.DataAnnotations;

namespace DichVuCong.Api.Features.Chatbot;

/// <summary>Cấu hình kho câu chưa trả lời trong PostgreSQL (mục <see cref="TenMuc"/>). Kho Mẫu có trần cố định 1.000 dòng.</summary>
public sealed class KhoCauChuaTraLoiOptions
{
    public const string TenMuc = "Chatbot:KhoCauChuaTraLoi";

    /// <summary>Số dòng mặc định khi cấu hình không khai.</summary>
    public const int SoDongMacDinh = 50_000;

    /// <summary>
    /// Trần số dòng của bảng <c>cau_chua_tra_loi</c>. Đầy thì câu <b>mới</b> bị bỏ qua (câu đã có vẫn cộng số lần gặp) và
    /// API ghi cảnh báo vào log, tối đa mỗi giờ một dòng (<see cref="CanhBaoKhoDay"/>); Trung tâm cần xem/xuất định kỳ để không đầy;
    /// chỗ trống có lại khi việc định kỳ xoá các dòng quá 90 ngày. Chọn bỏ qua thay vì xoá dòng cũ để không mất dữ liệu
    /// đã thu và để câu ghi vẫn là một câu SQL đơn giản. Trần là mềm: nhiều lần ghi đồng thời có thể vượt vài dòng.
    /// </summary>
    [Range(1, 10_000_000)]
    public int SoDongToiDa { get; init; } = SoDongMacDinh;
}
