namespace DichVuCong.Api.Features.Chatbot.TraLoi;

/// <summary>
/// Bước 5 (F06 BR-1): không khớp gì → câu xin lỗi kèm nút gọi Trung tâm (và Zalo nếu có), ghi câu đã che vào kho câu chưa trả lời.
/// Ghi lỗi chỉ log Warning (loại lỗi, không kèm nội dung câu) và vẫn trả đáp án. Cũng là đích của câu hỏi tình trạng hồ sơ cá nhân.
/// </summary>
internal sealed partial class BuocKhongHieu(IKhoCauChuaTraLoi kho, DuLieuNho du, ILogger<BuocKhongHieu> logger) : IChatHandler
{
    public int ThuTu => 1000;

    public async Task<CauTraLoiDto?> XuLyAsync(NguCanhHoi nguCanh, CancellationToken ct) => await TaoAsync(nguCanh, ct);

    public async Task<CauTraLoiDto> TaoAsync(NguCanhHoi nguCanh, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(nguCanh);

        await GhiAsync(nguCanh.CauChe, ct);
        var trungTam = await du.TrungTamAsync(ct);

        return new CauTraLoiDto(LoaiCauTraLoi.KhongHieu)
        {
            ThuTucDangNoi = nguCanh.MaDangNoi,
            LienHe = trungTam is null ? null : TraLoiTrungTam.LienHe(trungTam),
        };
    }

    private async Task GhiAsync(string cauChe, CancellationToken ct)
    {
        try
        {
            await kho.GhiAsync(cauChe, ct);
        }
#pragma warning disable CA1031 // Kho lỗi vì lý do gì cũng không được làm hỏng đáp án; chỉ ghi tên loại lỗi (không ghi message: có thể chứa câu hỏi).
        catch (Exception ex) when (ex is not OperationCanceledException)
#pragma warning restore CA1031
        {
            LogGhiLoi(logger, ex.GetType().Name);
        }
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Không ghi được câu chưa trả lời vào kho ({LoaiLoi}).")]
    private static partial void LogGhiLoi(ILogger logger, string loaiLoi);
}

/// <summary>Hỏi tình trạng hồ sơ cá nhân (trang không tra cứu hồ sơ) → thẳng tới bước 5, không tìm thủ tục.</summary>
internal sealed class BuocTinhTrangHoSo(BuocKhongHieu khongHieu) : IChatHandler
{
    public int ThuTu => 10;

    public async Task<CauTraLoiDto?> XuLyAsync(NguCanhHoi nguCanh, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(nguCanh);

        return nguCanh.PhanTich.HoiTinhTrangHoSo ? await khongHieu.TaoAsync(nguCanh, ct) : null;
    }
}
