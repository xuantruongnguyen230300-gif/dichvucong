using System.Text.RegularExpressions;
using DichVuCong.Data.DuLieu;

namespace DichVuCong.Api.Features.ChiTietThuTuc;

public interface IChiTietThuTucService
{
    /// <summary>Chi tiết thủ tục theo mã; null khi mã không có trong dữ liệu hoặc sai định dạng (không chạm nguồn dữ liệu).</summary>
    Task<ChiTietThuTucDto?> LayAsync(string? ma, CancellationToken cancellationToken);
}

public sealed partial class ChiTietThuTucService(INguonDuLieu nguon) : IChiTietThuTucService
{
    /// <summary>
    /// Mã đúng định dạng: 1–20 ký tự chữ, số, dấu chấm, gạch dưới, gạch nối (20 = độ dài tối đa của <c>thu_tuc.ma</c>),
    /// không gồm toàn dấu chấm (<c>.</c>, <c>..</c> là đoạn đường dẫn đặc biệt: trình duyệt rút gọn thành đường dẫn khác).
    /// </summary>
    public static bool LaMaHopLe(string? ma) => !string.IsNullOrEmpty(ma) && DinhDangMa().IsMatch(ma);

    public async Task<ChiTietThuTucDto?> LayAsync(string? ma, CancellationToken cancellationToken)
    {
        if (!LaMaHopLe(ma))
        {
            return null;
        }

        // Một dòng theo khoá chính. Chiếu ra kiểu ẩn danh rồi dựng record mới: không giữ, không sửa đối tượng của nguồn (R2).
        var dong = await nguon.ThuTucs
            .Where(t => t.Ma == ma)
            .Select(t => new
            {
                t.Ma,
                t.Ten,
                t.LinhVucMa,
                t.MucDo,
                t.CoQuanThucHien,
                t.ThoiHan,
                t.Phi,
                t.HinhThucNop,
                t.YeuCauDieuKien,
                t.KetQua,
                t.TrinhTu,
                t.CachThuc,
                t.ThanhPhanHoSo,
                t.CanCu,
            })
            .DauTienAsync(cancellationToken);
        if (dong is null)
        {
            return null;
        }

        var tenLinhVuc = await nguon.LinhVucs
            .Where(l => l.Ma == dong.LinhVucMa)
            .Select(l => l.Ten)
            .DauTienAsync(cancellationToken);

        return new ChiTietThuTucDto(
            dong.Ma,
            dong.Ten,
            tenLinhVuc ?? string.Empty,
            MucDoChuoi.Tu(dong.MucDo),
            dong.CoQuanThucHien,
            ThoiHanThuTuc.Chon(dong.ThoiHan, dong.CachThuc.Select(c => c.ThoiHan)),
            dong.Phi,
            [.. dong.HinhThucNop],
            dong.YeuCauDieuKien,
            [.. dong.TrinhTu.Select(b => new BuocTrinhTuDto(b.TruongHop, b.NoiDung))],
            [.. dong.CachThuc.Select(c => new CachThucNopDto(c.HinhThuc, ThoiHanThuTuc.LamRo(c.ThoiHan), c.Phi, c.MoTa))],
            [.. dong.ThanhPhanHoSo.Select(g => new GiayToDto(g.Ten, g.BanChinh, g.BanSao))],
            [.. dong.KetQua],
            [.. dong.CanCu.Select(c => new CanCuDto(c.SoKyHieu, c.TrichYeu))]);
    }

    // \z (không phải $): "1.001193\n" không được lọt qua.
    [GeneratedRegex(@"^(?!\.+\z)[A-Za-z0-9._-]{1,20}\z", RegexOptions.CultureInvariant, matchTimeoutMilliseconds: 100)]
    private static partial Regex DinhDangMa();
}
