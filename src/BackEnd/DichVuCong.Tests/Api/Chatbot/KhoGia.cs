using System.Collections.Concurrent;
using DichVuCong.Api.Features.Chatbot;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>
/// Kho câu chưa trả lời giả cho test việc định kỳ: ghi lại mốc của từng lần xoá, trả <see cref="SoDongXoa"/>;
/// bật <see cref="Loi"/> thì ném lỗi như khi kho không dùng được.
/// </summary>
internal sealed class KhoGia : IKhoCauChuaTraLoi
{
    private readonly ConcurrentQueue<DateTimeOffset> _cacMoc = new();
    private volatile bool _loi;

    public bool Loi
    {
        get => _loi;
        set => _loi = value;
    }

    public int SoDongXoa { get; init; }

    public IReadOnlyCollection<DateTimeOffset> CacMoc => _cacMoc;

    public Task GhiAsync(string noiDung, CancellationToken ct) => throw new NotSupportedException();

    public Task<int> XoaQuaHanAsync(DateTimeOffset moc, CancellationToken ct)
    {
        if (Loi)
        {
            throw new InvalidOperationException("Giả lập kho không dùng được");
        }

        _cacMoc.Enqueue(moc);
        return Task.FromResult(SoDongXoa);
    }
}
