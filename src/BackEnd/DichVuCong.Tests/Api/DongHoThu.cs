namespace DichVuCong.Tests.Api;

/// <summary><see cref="TimeProvider"/> giả cho bộ đếm thời gian (<c>GetTimestamp</c>): chỉ đổi khi gọi <see cref="TienToi"/>.</summary>
internal sealed class DongHoThu : TimeProvider
{
    private long _tick;

    public override long TimestampFrequency => 1000;

    public override long GetTimestamp() => Volatile.Read(ref _tick);

    public void TienToi(TimeSpan khoang) => Interlocked.Add(ref _tick, (long)khoang.TotalMilliseconds);
}
