using DichVuCong.Api.Common.Caching;
using DichVuCong.Data.DuLieu;

namespace DichVuCong.Api.Features.Chatbot.TimKiem;

/// <summary>
/// Giữ một <see cref="ChiMucTroLy"/> mới nhất, khoá bằng <see cref="IPhienBanDuLieu"/> (plan F06 §4.2). Mỗi yêu cầu lấy phiên bản
/// (một truy vấn khoá chính ở PostgreSql, đọc bộ nhớ ở nguồn Mẫu); khác phiên bản đang giữ thì dựng lại bằng nguồn dữ liệu
/// của chính yêu cầu đó. Nhiều yêu cầu cùng lúc chỉ dựng một lần (khoá, kiểm hai lần). Phiên bản đổi tiếp trong lúc dựng thì
/// lần sau dựng lại; không ném lỗi. Đăng ký singleton.
/// </summary>
public sealed class KhoChiMuc
{
    private readonly SemaphoreSlim _khoa = new(1, 1);
    private ChiMucTroLy? _hienTai;

    /// <summary>Số lần đã dựng chỉ mục từ đầu tiến trình (cho test và chẩn đoán).</summary>
    public int SoLanDung { get; private set; }

    internal async Task<ChiMucTroLy> LayAsync(INguonDuLieu nguon, IPhienBanDuLieu phienBan, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(nguon);
        ArgumentNullException.ThrowIfNull(phienBan);

        var v = await phienBan.LayAsync(ct);
        var dangGiu = Volatile.Read(ref _hienTai);
        if (dangGiu is not null && dangGiu.PhienBan == v)
        {
            return dangGiu;
        }

        await _khoa.WaitAsync(ct);
        try
        {
            // Yêu cầu khác có thể vừa dựng xong trong lúc chờ khoá.
            dangGiu = Volatile.Read(ref _hienTai);
            if (dangGiu is not null && dangGiu.PhienBan == v)
            {
                return dangGiu;
            }

            var moi = await DungChiMuc.DungAsync(nguon, v, ct);
            Volatile.Write(ref _hienTai, moi);
            SoLanDung++;

            return moi;
        }
        finally
        {
            _khoa.Release();
        }
    }
}
