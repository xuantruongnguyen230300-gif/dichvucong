using DichVuCong.Data.DuLieu;

namespace DichVuCong.Api.Common.Caching;

/// <summary>Phiên bản dữ liệu nhập: đổi mỗi khi có một lần nhập mới (nguồn Mẫu: <c>thoiDiem</c> của file).</summary>
public interface IPhienBanDuLieu
{
    /// <summary>Số tick UTC của lần nhập gần nhất; 0 khi chưa nhập lần nào.</summary>
    Task<long> LayAsync(CancellationToken cancellationToken);
}

/// <summary>
/// Phiên bản theo yêu cầu: đọc từ <see cref="BoNhoPhienBanDuLieu"/> đúng một lần rồi giữ, để policy cache và middleware 304
/// của cùng một yêu cầu luôn thấy cùng một giá trị (kể cả khi bộ nhớ hết hạn giữa chừng).
/// </summary>
public sealed class PhienBanDuLieu(BoNhoPhienBanDuLieu boNho) : IPhienBanDuLieu
{
    private long? _giaTri;

    public async Task<long> LayAsync(CancellationToken cancellationToken)
    {
        _giaTri ??= await boNho.LayAsync(cancellationToken);

        return _giaTri.Value;
    }
}

/// <summary>
/// Giữ phiên bản dữ liệu trong bộ nhớ <c>Caching:PhienBanDuLieu</c> giây: số truy vấn <c>max(thoi_diem)</c> không tăng theo
/// số yêu cầu. Nhập xong, dữ liệu mới hiện sau tối đa chừng đó (F00 plan §9). Lỗi đọc không được giữ lại.
/// </summary>
public sealed class BoNhoPhienBanDuLieu(IServiceScopeFactory scopes, CachingOptions options, TimeProvider thoiGian)
{
    private readonly SemaphoreSlim _khoa = new(1, 1);
    private long _giaTri;
    private long _hetHanLuc = long.MinValue;

    public async Task<long> LayAsync(CancellationToken cancellationToken)
    {
        if (CoHieuLuc())
        {
            return Volatile.Read(ref _giaTri);
        }

        await _khoa.WaitAsync(cancellationToken);
        try
        {
            // Yêu cầu khác có thể vừa đọc xong trong lúc chờ khoá.
            if (!CoHieuLuc())
            {
                var giaTri = await DocAsync(cancellationToken);
                Volatile.Write(ref _giaTri, giaTri);
                Volatile.Write(ref _hetHanLuc, thoiGian.GetTimestamp() + (long)(options.PhienBanDuLieu.TotalSeconds * thoiGian.TimestampFrequency));
            }

            return Volatile.Read(ref _giaTri);
        }
        finally
        {
            _khoa.Release();
        }
    }

    private bool CoHieuLuc() => thoiGian.GetTimestamp() < Volatile.Read(ref _hetHanLuc);

    private async Task<long> DocAsync(CancellationToken cancellationToken)
    {
        await using var scope = scopes.CreateAsyncScope();
        var nguon = scope.ServiceProvider.GetRequiredService<INguonDuLieu>();
        var thoiDiem = await nguon.LanNhaps.LonNhatAsync(l => (DateTimeOffset?)l.ThoiDiem, cancellationToken);

        return thoiDiem?.UtcTicks ?? 0;
    }
}
