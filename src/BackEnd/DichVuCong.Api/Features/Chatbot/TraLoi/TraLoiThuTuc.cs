using DichVuCong.Api.Features.ChiTietThuTuc;
using DichVuCong.Api.Features.Chatbot.TimKiem;

namespace DichVuCong.Api.Features.Chatbot.TraLoi;

/// <summary>
/// Trả lời đúng mục được hỏi của một thủ tục (F06 BR-1 bước 3, plan §4.6). Chi tiết lấy từ <see cref="IChiTietThuTucService"/>
/// của F03 (một truy vấn khoá chính), cắt bớt theo giới hạn từng mục; <c>Tong</c> ghi tổng số phần tử khi có cắt.
/// </summary>
internal sealed class TraLoiThuTuc(IChiTietThuTucService chiTiet, DuLieuNho du)
{
    public const int SoGiayToToiDa = 8;
    public const int SoBuocToiDa = 2;
    public const int DoDaiBuocToiDa = 500;
    public const int SoKetQuaToiDa = 6;
    public const int SoCanCuToiDa = 6;
    public const int DoDaiTrichYeuToiDa = 200;
    public const int SoThuTucKhacToiDa = 3;

    private const string DauCat = "…";

    /// <summary>Null nếu thủ tục không còn trong dữ liệu (đổi giữa hai lần nhập).</summary>
    public async Task<CauTraLoiDto?> TaoAsync(ThuTucChiMuc thuTuc, string muc, IReadOnlyList<ThuTucNganDto> khac, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(thuTuc);

        var ct1 = await chiTiet.LayAsync(thuTuc.Ma, ct);
        if (ct1 is null)
        {
            return null;
        }

        var cau = new CauTraLoiDto(LoaiCauTraLoi.ThuTuc)
        {
            ThuTucDangNoi = thuTuc.Ma,
            Muc = muc,
            ThuTuc = thuTuc.Dto,
            ThuTucKhac = khac,
            NoiDung = DungNoiDung(ct1, muc),
        };
        if (!string.Equals(muc, MucThuTucTroLy.NoiNop, StringComparison.Ordinal))
        {
            return cau;
        }

        var phanCong = await du.PhanCongAsync(thuTuc.LinhVucMa, ct);
        var trungTam = await du.TrungTamAsync(ct);

        return cau with { Quay = phanCong?.Quay, NoiTiepNhanChuyen = phanCong?.NoiTiepNhanChuyen, TrungTam = trungTam?.Ngan };
    }

    private static NoiDungMucDto DungNoiDung(ChiTietThuTucDto c, string muc)
    {
        var rong = new NoiDungMucDto(null, null, null, null, null, null, null, null);

        return muc switch
        {
            MucThuTucTroLy.ThoiHan => rong with { ThoiHan = c.ThoiHan },
            MucThuTucTroLy.Phi => rong with { Phi = c.Phi },
            MucThuTucTroLy.NoiNop => rong with { HinhThucNop = c.HinhThucNop },
            MucThuTucTroLy.HoSo => rong with { ThanhPhanHoSo = [.. c.ThanhPhanHoSo.Take(SoGiayToToiDa)], Tong = TongNeuCat(c.ThanhPhanHoSo.Count, SoGiayToToiDa) },
            MucThuTucTroLy.TrinhTu => rong with
            {
                TrinhTu = [.. c.TrinhTu.Take(SoBuocToiDa).Select(b => b with { NoiDung = Cat(b.NoiDung, DoDaiBuocToiDa) })],
                Tong = TongNeuCat(c.TrinhTu.Count, SoBuocToiDa),
            },
            MucThuTucTroLy.KetQua => rong with { KetQua = [.. c.KetQua.Take(SoKetQuaToiDa)], Tong = TongNeuCat(c.KetQua.Count, SoKetQuaToiDa) },
            MucThuTucTroLy.CanCu => rong with
            {
                CanCu = [.. c.CanCu.Take(SoCanCuToiDa).Select(x => x with { TrichYeu = x.TrichYeu is null ? null : Cat(x.TrichYeu, DoDaiTrichYeuToiDa) })],
                Tong = TongNeuCat(c.CanCu.Count, SoCanCuToiDa),
            },
            _ => throw new ArgumentOutOfRangeException(nameof(muc), muc, "Mục thủ tục không hỗ trợ."),
        };
    }

    private static int? TongNeuCat(int tong, int toiDa) => tong > toiDa ? tong : null;

    /// <summary>Cắt về tối đa <paramref name="toiDa"/> ký tự kể cả dấu "…", không cắt giữa cặp surrogate.</summary>
    internal static string Cat(string chuoi, int toiDa)
    {
        if (chuoi.Length <= toiDa)
        {
            return chuoi;
        }

        var doDai = toiDa - DauCat.Length;
        if (char.IsHighSurrogate(chuoi[doDai - 1]))
        {
            doDai--;
        }

        return string.Concat(chuoi.AsSpan(0, doDai), DauCat);
    }
}

/// <summary>Bước 3 (F06 BR-1): hỏi một mục cụ thể và xác định được thủ tục (đủ chắc, hoặc đang nói tới) → trả đúng mục đó.</summary>
internal sealed class BuocMucThuTuc(TraLoiThuTuc traLoi) : IChatHandler
{
    public int ThuTu => 40;

    public async Task<CauTraLoiDto?> XuLyAsync(NguCanhHoi nguCanh, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(nguCanh);

        if (nguCanh.PhanTich.MucHoi is not { } muc)
        {
            return null;
        }

        ThuTucChiMuc? thuTuc;
        IReadOnlyList<ThuTucNganDto> khac = [];
        if (nguCanh.UngDauChac is { } dau)
        {
            thuTuc = dau.ThuTuc;
            khac = [.. nguCanh.Ung.Skip(1).Where(u => u.DuLienQuan).Take(TraLoiThuTuc.SoThuTucKhacToiDa).Select(u => u.ThuTuc.Dto)];
        }
        else
        {
            thuTuc = nguCanh.ThuTucDangNoi;
        }

        return thuTuc is null ? null : await traLoi.TaoAsync(thuTuc, muc, khac, ct);
    }
}

/// <summary>Bước 4 (F06 BR-1): chỉ tìm được thủ tục → tối đa 5 thủ tục gần nhất, kèm gợi ý hỏi tiếp.</summary>
internal sealed class BuocDanhSachThuTuc : IChatHandler
{
    public const int SoThuTucToiDa = 5;

    public int ThuTu => 50;

    public Task<CauTraLoiDto?> XuLyAsync(NguCanhHoi nguCanh, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(nguCanh);

        var danhSach = nguCanh.Ung.Where(u => u.DuLienQuan).Take(SoThuTucToiDa).ToList();
        if (danhSach.Count == 0)
        {
            return Task.FromResult<CauTraLoiDto?>(null);
        }

        return Task.FromResult<CauTraLoiDto?>(new CauTraLoiDto(LoaiCauTraLoi.ThuTucDanhSach)
        {
            ThuTucDangNoi = nguCanh.UngDauChac?.ThuTuc.Ma ?? nguCanh.MaDangNoi,
            DanhSachThuTuc = [.. danhSach.Select(u => u.ThuTuc.Dto)],
        });
    }
}
