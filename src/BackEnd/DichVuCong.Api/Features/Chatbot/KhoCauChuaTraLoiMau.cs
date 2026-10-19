namespace DichVuCong.Api.Features.Chatbot;

/// <summary>
/// Kho câu chưa trả lời trong bộ nhớ (nguồn <c>Mau</c>): mất khi tắt API, không xuất được. Tối đa
/// <see cref="SoDongToiDa"/> dòng để bị dội câu hỏi cũng không phình bộ nhớ (1.000 dòng × 500 ký tự ≈ 1 MB);
/// đầy mà gặp câu mới thì bỏ dòng có lần gặp cuối cũ nhất. Đăng ký singleton.
/// </summary>
internal sealed class KhoCauChuaTraLoiMau(TimeProvider timeProvider) : IKhoCauChuaTraLoi
{
    /// <summary>Số dòng tối đa.</summary>
    public const int SoDongToiDa = 1_000;

    private readonly Lock _khoa = new();
    private readonly Dictionary<string, Dong> _cacDong = new(StringComparer.Ordinal);
    private long _thuTuGhi;

    /// <remarks>Lỗi (câu không hợp lệ, huỷ) trả về qua <see cref="Task"/> như kho PostgreSQL, không ném đồng bộ.</remarks>
    public Task GhiAsync(string noiDung, CancellationToken ct)
    {
        if (ct.IsCancellationRequested)
        {
            return Task.FromCanceled(ct);
        }

        CauDaChuanBi cau;
        try
        {
            cau = GopCauChuaTraLoi.ChuanBi(noiDung);
        }
        catch (ArgumentException ex)
        {
            // ArgumentOutOfRangeException cũng là ArgumentException.
            return Task.FromException(ex);
        }

        var bayGio = timeProvider.GetUtcNow();
        lock (_khoa)
        {
            _thuTuGhi++;
            if (_cacDong.TryGetValue(cau.KhoaGop, out var dong))
            {
                dong.SoLanGap++;
                dong.LanGapCuoi = bayGio;
                dong.ThuTuGhi = _thuTuGhi;
            }
            else
            {
                if (_cacDong.Count >= SoDongToiDa)
                {
                    BoDongCuNhat();
                }

                _cacDong.Add(cau.KhoaGop, new Dong(cau.NoiDung) { SoLanGap = 1, LanGapCuoi = bayGio, ThuTuGhi = _thuTuGhi });
            }
        }

        return Task.CompletedTask;
    }

    public Task<int> XoaQuaHanAsync(DateTimeOffset moc, CancellationToken ct)
    {
        if (ct.IsCancellationRequested)
        {
            return Task.FromCanceled<int>(ct);
        }

        lock (_khoa)
        {
            var quaHan = _cacDong.Where(p => p.Value.LanGapCuoi < moc).Select(p => p.Key).ToList();
            foreach (var khoa in quaHan)
            {
                _cacDong.Remove(khoa);
            }

            return Task.FromResult(quaHan.Count);
        }
    }

    /// <summary>Bản chụp các dòng hiện có (cho test và chẩn đoán), cũ nhất trước.</summary>
    internal IReadOnlyList<CauDaGhi> ChupCacDong()
    {
        lock (_khoa)
        {
            return [.. _cacDong
                .OrderBy(p => p.Value.LanGapCuoi).ThenBy(p => p.Value.ThuTuGhi)
                .Select(p => new CauDaGhi(p.Value.NoiDung, p.Key, p.Value.SoLanGap, p.Value.LanGapCuoi))];
        }
    }

    /// <summary>Gọi trong khoá. Lần gặp cuối cũ nhất; bằng nhau thì dòng được ghi sớm hơn.</summary>
    private void BoDongCuNhat()
    {
        string? khoaCuNhat = null;
        Dong? cuNhat = null;
        foreach (var (khoa, dong) in _cacDong)
        {
            if (cuNhat is null
                || dong.LanGapCuoi < cuNhat.LanGapCuoi
                || (dong.LanGapCuoi == cuNhat.LanGapCuoi && dong.ThuTuGhi < cuNhat.ThuTuGhi))
            {
                khoaCuNhat = khoa;
                cuNhat = dong;
            }
        }

        if (khoaCuNhat is not null)
        {
            _cacDong.Remove(khoaCuNhat);
        }
    }

    private sealed class Dong(string noiDung)
    {
        public string NoiDung { get; } = noiDung;

        public int SoLanGap { get; set; }

        public DateTimeOffset LanGapCuoi { get; set; }

        public long ThuTuGhi { get; set; }
    }
}

/// <summary>Một dòng của kho Mẫu, chỉ để đọc.</summary>
internal sealed record CauDaGhi(string NoiDung, string KhoaGop, int SoLanGap, DateTimeOffset LanGapCuoi);
