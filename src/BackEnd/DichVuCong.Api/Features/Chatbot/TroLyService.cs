using System.Diagnostics;
using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Features.ChiTietThuTuc;
using DichVuCong.Api.Features.Chatbot.TimKiem;
using DichVuCong.Api.Features.Chatbot.TraLoi;
using DichVuCong.Data.DuLieu;
using Microsoft.Extensions.Options;

namespace DichVuCong.Api.Features.Chatbot;

public interface ITroLyService
{
    /// <summary>Trả lời một câu hỏi. <paramref name="maThuTuc"/>: thủ tục đang nói tới (sai định dạng hoặc không có trong dữ liệu thì bỏ qua).</summary>
    Task<CauTraLoiDto> HoiAsync(string cauHoi, string? maThuTuc, CancellationToken ct);

    /// <summary>Trả lời khi bấm chủ đề thứ <paramref name="thuTu"/>; null nếu không có chủ đề đó.</summary>
    Task<CauTraLoiDto?> HoiChuDeAsync(int thuTu, string? maThuTuc, CancellationToken ct);

    /// <summary>Danh sách chip chủ đề theo thứ tự trong dữ liệu.</summary>
    Task<IReadOnlyList<ChuDeGoiYDto>> LayChuDeAsync(CancellationToken ct);
}

/// <summary>
/// Trợ lý trả lời theo luật (F06). Câu hỏi đi qua các <see cref="IChatHandler"/> theo thứ tự; bước đầu trả đáp án thì dừng.
/// Không giữ trạng thái giữa hai câu: ngữ cảnh do client gửi kèm (<c>maThuTuc</c>). Log chỉ có loại đáp án và thời gian xử lý,
/// không bao giờ có nội dung câu hỏi.
/// </summary>
internal sealed partial class TroLyService(
    KhoChiMuc kho,
    INguonDuLieu nguon,
    IPhienBanDuLieu phienBan,
    IOptions<ChamDiemOptions> tuyChon,
    IEnumerable<IChatHandler> cacBuoc,
    TraLoiChuDe chuDe,
    ILogger<TroLyService> logger) : ITroLyService
{
    private readonly IChatHandler[] _cacBuoc = [.. cacBuoc.OrderBy(b => b.ThuTu)];

    public async Task<CauTraLoiDto> HoiAsync(string cauHoi, string? maThuTuc, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(cauHoi);

        var batDau = Stopwatch.GetTimestamp();
        var opt = tuyChon.Value;
        var chiMuc = await kho.LayAsync(nguon, phienBan, ct);
        var nguCanh = TaoNguCanh(chiMuc, cauHoi, maThuTuc, opt);

        foreach (var buoc in _cacBuoc)
        {
            var ketQua = await buoc.XuLyAsync(nguCanh, ct);
            if (ketQua is not null)
            {
                LogDapAn(logger, ketQua.Loai, (long)Stopwatch.GetElapsedTime(batDau).TotalMilliseconds);

                return ketQua;
            }
        }

        throw new InvalidOperationException("Không có bước nào trả lời; bước cuối phải luôn trả đáp án.");
    }

    public async Task<CauTraLoiDto?> HoiChuDeAsync(int thuTu, string? maThuTuc, CancellationToken ct)
    {
        var batDau = Stopwatch.GetTimestamp();
        var chiMuc = await kho.LayAsync(nguon, phienBan, ct);
        var ketQua = await chuDe.TaoAsync(chiMuc, thuTu, LayNguCanh(chiMuc, maThuTuc), ct);
        if (ketQua is not null)
        {
            LogDapAn(logger, ketQua.Loai, (long)Stopwatch.GetElapsedTime(batDau).TotalMilliseconds);
        }

        return ketQua;
    }

    public async Task<IReadOnlyList<ChuDeGoiYDto>> LayChuDeAsync(CancellationToken ct)
    {
        var chiMuc = await kho.LayAsync(nguon, phienBan, ct);

        return [.. chiMuc.ChuDes.Select(c => new ChuDeGoiYDto(c.ThuTu, c.TenHienThi))];
    }

    private static ThuTucChiMuc? LayNguCanh(ChiMucTroLy chiMuc, string? maThuTuc)
        => ChiTietThuTucService.LaMaHopLe(maThuTuc) ? chiMuc.TheoMa(maThuTuc) : null;

    private static NguCanhHoi TaoNguCanh(ChiMucTroLy chiMuc, string cauHoi, string? maThuTuc, ChamDiemOptions opt)
    {
        var phanTich = PhanTichCauHoi.Chay(CheThongTinCaNhan.Bo(cauHoi), chiMuc, opt);

        return new NguCanhHoi
        {
            ChiMuc = chiMuc,
            PhanTich = phanTich,
            CauChe = CheThongTinCaNhan.Che(cauHoi.Trim()),
            ThuTucDangNoi = LayNguCanh(chiMuc, maThuTuc),
            Ung = ChamDiem.TimThuTuc(chiMuc, phanTich, opt),
            Opt = opt,
        };
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Trợ lý trả lời loại {Loai} trong {ThoiGianMs} ms.")]
    private static partial void LogDapAn(ILogger logger, string loai, long thoiGianMs);
}
