namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>
/// <see cref="TimeProvider"/> giả: giờ chỉ đổi khi gọi <see cref="TienToi"/>; hẹn giờ (vd. <see cref="PeriodicTimer"/>)
/// chạy khi giờ giả tới hạn.
/// </summary>
internal sealed class DongHoGia(DateTimeOffset batDau) : TimeProvider
{
    private readonly Lock _khoa = new();
    private readonly List<HenGio> _cacHenGio = [];
    private DateTimeOffset _bayGio = batDau;

    public override DateTimeOffset GetUtcNow()
    {
        lock (_khoa)
        {
            return _bayGio;
        }
    }

    public override ITimer CreateTimer(TimerCallback callback, object? state, TimeSpan dueTime, TimeSpan period)
    {
        var henGio = new HenGio(this, callback, state);
        henGio.Change(dueTime, period);
        lock (_khoa)
        {
            _cacHenGio.Add(henGio);
        }

        return henGio;
    }

    /// <summary>Tiến giờ giả rồi gọi các hẹn giờ đã tới hạn (ngoài khoá).</summary>
    public void TienToi(TimeSpan khoang)
    {
        var canGoi = new List<HenGio>();
        lock (_khoa)
        {
            _bayGio += khoang;
            foreach (var henGio in _cacHenGio)
            {
                while (henGio.DenHan is { } denHan && denHan <= _bayGio)
                {
                    canGoi.Add(henGio);
                    henGio.DenHan = henGio.ChuKy > TimeSpan.Zero ? denHan + henGio.ChuKy : null;
                }
            }
        }

        foreach (var henGio in canGoi)
        {
            henGio.Goi();
        }
    }

    private sealed class HenGio(DongHoGia dongHo, TimerCallback callback, object? state) : ITimer
    {
        public DateTimeOffset? DenHan { get; set; }

        public TimeSpan ChuKy { get; private set; }

        public bool Change(TimeSpan dueTime, TimeSpan period)
        {
            lock (dongHo._khoa)
            {
                ChuKy = period;
                DenHan = dueTime == Timeout.InfiniteTimeSpan ? null : dongHo._bayGio + dueTime;
            }

            return true;
        }

        public void Goi() => callback(state);

        public void Dispose()
        {
            lock (dongHo._khoa)
            {
                DenHan = null;
                dongHo._cacHenGio.Remove(this);
            }
        }

        public ValueTask DisposeAsync()
        {
            Dispose();
            return ValueTask.CompletedTask;
        }
    }
}
