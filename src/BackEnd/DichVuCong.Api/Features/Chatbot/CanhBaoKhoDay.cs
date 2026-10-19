namespace DichVuCong.Api.Features.Chatbot;

/// <summary>
/// Báo cho người vận hành biết kho câu chưa trả lời đã chạm trần (câu mới bị bỏ qua). Singleton để giới hạn
/// <b>một dòng log mỗi giờ</b> cho cả ứng dụng, không phụ thuộc số yêu cầu. Log không có nội dung câu hỏi.
/// </summary>
internal sealed partial class CanhBaoKhoDay(TimeProvider timeProvider, ILogger<KhoCauChuaTraLoiPostgreSql> logger)
{
    private static readonly long KhoangCachTicks = TimeSpan.FromHours(1).Ticks;

    // Ticks UTC của lần cảnh báo cuối; 0 = chưa lần nào.
    private long _lanCuoi;

    /// <summary>Ghi cảnh báo nếu đã quá một giờ kể từ lần ghi trước.</summary>
    public void Bao(int soDongToiDa)
    {
        var bayGio = timeProvider.GetUtcNow().UtcTicks;
        var cu = Interlocked.Read(ref _lanCuoi);
        if (cu != 0 && bayGio - cu < KhoangCachTicks)
        {
            return;
        }

        // Nhiều luồng cùng tới: chỉ luồng đổi được giá trị mới ghi.
        if (Interlocked.CompareExchange(ref _lanCuoi, bayGio, cu) != cu)
        {
            return;
        }

        LogKhoDay(logger, soDongToiDa);
    }

    [LoggerMessage(Level = LogLevel.Warning,
        Message = "Kho câu chưa trả lời đã đầy trần {SoDongToiDa} dòng: câu mới bị bỏ qua cho tới khi xoá bớt. Trung tâm cần xem/xuất câu chưa trả lời định kỳ.")]
    private static partial void LogKhoDay(ILogger logger, int soDongToiDa);
}
