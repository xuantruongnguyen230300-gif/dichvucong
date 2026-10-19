using System.Globalization;

namespace DichVuCong.Api.Features.Chatbot.TimKiem;

/// <summary>
/// Kết quả phân tích một câu hỏi (plan F06 §4.3). <see cref="Tho"/>: dãy từ gốc (chưa mở rộng, chưa sửa) — dùng nhận tên người;
/// <see cref="Day"/>: dãy từ sau mở rộng viết tắt, thay đồng nghĩa và sửa lỗi gõ — dùng nhận ý hỏi, quầy, lĩnh vực.
/// </summary>
internal sealed class CauDaPhanTich
{
    public required string[] Tho { get; init; }

    public required string[] Day { get; init; }

    /// <summary>Song song với <see cref="Day"/>: từ đó là kết quả sửa lỗi gõ.</summary>
    public required bool[] DaSua { get; init; }

    /// <summary>Thủ tục nhận ra từ mã (<c>Ma</c> hoặc <c>MaDvc</c>) nằm trong câu.</summary>
    public ThuTucChiMuc? ThuTucTheoMa { get; init; }

    /// <summary>Mục được hỏi (cụm đầu theo thứ tự bảng), null nếu không hỏi mục nào.</summary>
    public string? MucHoi { get; init; }

    /// <summary>Truy vấn tìm câu hỏi mẫu: bỏ từ đệm và cụm lời dẫn, giữ cụm chỉ mục hỏi và cụm hỏi chung.</summary>
    public required TuTruyVan[] TuMau { get; init; }

    /// <summary>Truy vấn tìm thủ tục: <see cref="TuMau"/> bỏ thêm chữ của mọi cụm chỉ mục hỏi, cụm hỏi chung và "thu", "tuc".</summary>
    public required TuTruyVan[] TuNoiDung { get; init; }

    public bool HoiTinhTrangHoSo { get; init; }

    public bool HoiCanBo { get; init; }

    public bool HoiQuay { get; init; }

    /// <summary>Số quầy nêu trong câu ("quầy 4"), null nếu không có.</summary>
    public int? SoQuay { get; init; }
}

/// <summary>Biến câu hỏi (đã bỏ số, email) thành <see cref="CauDaPhanTich"/> theo sáu bước của plan F06 §4.3.</summary>
internal static class PhanTichCauHoi
{
    private static readonly char[] DauCauHaiDau = ['(', ')', ',', ';', ':', '?', '!', '"', '\''];

    public static CauDaPhanTich Chay(string cauBo, ChiMucTroLy chiMuc, ChamDiemOptions opt)
    {
        ArgumentNullException.ThrowIfNull(cauBo);
        ArgumentNullException.ThrowIfNull(chiMuc);
        ArgumentNullException.ThrowIfNull(opt);

        var tho = ChuoiTu.Tach(cauBo);
        var thuTucTheoMa = TimThuTucTheoMa(cauBo, chiMuc);

        var daMoRong = ChuoiTu.ThayDay(ChuoiTu.ThayDay(tho, chiMuc.VietTat), chiMuc.DongNghia);
        var (day, daSua) = SuaLoiGo(daMoRong, chiMuc.TuDien, opt);

        var boMau = new bool[day.Length];
        var boNoiDung = new bool[day.Length];
        DanhDau(day, NgonNguHoi.CumDemLoiDan, boMau);
        string? mucHoi = null;
        foreach (var nhom in NgonNguHoi.CacMucHoi)
        {
            if (DanhDau(day, nhom.Cum, boNoiDung))
            {
                mucHoi ??= nhom.Muc;
            }
        }

        DanhDau(day, NgonNguHoi.CumHoiChung, boNoiDung);
        var soQuay = TimSoQuay(day);

        return new CauDaPhanTich
        {
            Tho = tho,
            Day = day,
            DaSua = daSua,
            ThuTucTheoMa = thuTucTheoMa,
            MucHoi = mucHoi,
            TuMau = RutTu(day, daSua, i => boMau[i] || NgonNguHoi.TuDem.Contains(day[i])),
            TuNoiDung = RutTu(day, daSua, i => boMau[i] || boNoiDung[i] || NgonNguHoi.TuDem.Contains(day[i]) || NgonNguHoi.TuThuTuc.Contains(day[i]) || LaSo(day[i])),
            HoiTinhTrangHoSo = NgonNguHoi.CumTinhTrangHoSo.Any(c => ChuoiTu.ChuaDay(day, c)),
            HoiCanBo = soQuay is not null || NgonNguHoi.CumHoiCanBo.Any(c => ChuoiTu.ChuaDay(day, c)),
            HoiQuay = ChuoiTu.ChuaDay(day, NgonNguHoi.TuQuay),
            SoQuay = soQuay,
        };
    }

    /// <summary>
    /// Từ chỉ gồm chữ số (ngày, tháng, năm, số thứ tự). Không dùng để chấm thủ tục: "xem bói 12 05 2026" không được khớp
    /// số hiệu văn bản trong tên thủ tục. Thủ tục hỏi bằng mã đã nhận riêng ở <see cref="TimThuTucTheoMa"/>.
    /// </summary>
    private static bool LaSo(string tu) => tu.Length > 0 && tu.All(char.IsAsciiDigit);

    /// <summary>Mảnh nào của câu (tách ở khoảng trắng, bỏ dấu câu hai đầu và dấu chấm cuối) bằng mã thủ tục thì nhận.</summary>
    private static ThuTucChiMuc? TimThuTucTheoMa(string cauBo, ChiMucTroLy chiMuc)
    {
        foreach (var manh in cauBo.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries))
        {
            var ma = manh.Trim(DauCauHaiDau).TrimEnd('.');
            if (ma.Length is >= 3 and <= 40 && chiMuc.TheoMaHoacMaDvc(ma) is { } thuTuc)
            {
                return thuTuc;
            }
        }

        return null;
    }

    private static (string[] Day, bool[] DaSua) SuaLoiGo(string[] tu, TuDien tuDien, ChamDiemOptions opt)
    {
        var day = new string[tu.Length];
        var daSua = new bool[tu.Length];
        for (var i = 0; i < tu.Length; i++)
        {
            var sua = tuDien.Sua(tu[i], opt);
            day[i] = sua ?? tu[i];
            daSua[i] = sua is not null;
        }

        return (day, daSua);
    }

    /// <summary>Đánh dấu mọi chữ của mọi cụm khớp; trả true nếu có cụm nào khớp.</summary>
    private static bool DanhDau(string[] day, string[][] cum, bool[] bo)
    {
        var coKhop = false;
        foreach (var c in cum)
        {
            foreach (var viTri in ChuoiTu.MoiViTri(day, c))
            {
                coKhop = true;
                for (var j = 0; j < c.Length; j++)
                {
                    bo[viTri + j] = true;
                }
            }
        }

        return coKhop;
    }

    private static int? TimSoQuay(string[] day)
    {
        for (var i = 0; i + 1 < day.Length; i++)
        {
            if (string.Equals(day[i], "quay", StringComparison.Ordinal)
                && day[i + 1].All(char.IsAsciiDigit)
                && int.TryParse(day[i + 1], NumberStyles.None, CultureInfo.InvariantCulture, out var so))
            {
                return so;
            }
        }

        return null;
    }

    /// <summary>Từ không bị bỏ, không trùng, theo thứ tự xuất hiện; từ trùng giữ bản chưa sửa lỗi nếu có.</summary>
    private static TuTruyVan[] RutTu(string[] day, bool[] daSua, Func<int, bool> biBo)
    {
        var thuTu = new List<string>();
        var trangThai = new Dictionary<string, bool>(StringComparer.Ordinal);
        for (var i = 0; i < day.Length; i++)
        {
            if (biBo(i))
            {
                continue;
            }

            if (trangThai.TryGetValue(day[i], out var daSuaTruoc))
            {
                trangThai[day[i]] = daSuaTruoc && daSua[i];
            }
            else
            {
                trangThai.Add(day[i], daSua[i]);
                thuTu.Add(day[i]);
            }
        }

        return [.. thuTu.Select(t => new TuTruyVan(t, trangThai[t]))];
    }
}
