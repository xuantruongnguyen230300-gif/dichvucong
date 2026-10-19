using System.Globalization;
using System.Text.RegularExpressions;
using DichVuCong.Data.Text;
using DichVuCong.Import.Resources;

namespace DichVuCong.Import.Excel;

internal enum LoaiO
{
    Trong,
    Chu,
    So,
    Gio,
    Bool,
    LoiCongThuc,
}

/// <summary>Một ô đã đọc. Giữ kiểu gốc để bắt ô số ở cột mã (plan F01 §3.1).</summary>
internal readonly record struct OExcel(LoaiO Loai, string Chu = "", double So = 0, TimeSpan Gio = default);

/// <summary>
/// Một dòng dữ liệu đã đọc từ sheet. Các hàm lấy giá trị kiểm kiểu, độ dài, bắt buộc theo <see cref="MauExcel"/>
/// và gom mọi lý do lỗi của dòng vào <see cref="LyDo"/>.
/// </summary>
internal sealed partial class DongDoc
{
    private const int DoDaiHienToiDa = 40;

    private static readonly char[] DauTachDanhSach = [';', '\n'];

    private readonly IReadOnlyDictionary<string, CotMau> _cot;
    private readonly Dictionary<string, OExcel> _o;
    private readonly List<string> _lyDo = [];

    public DongDoc(string sheet, int so, IReadOnlyDictionary<string, CotMau> cot, Dictionary<string, OExcel> o)
    {
        Sheet = sheet;
        So = so;
        _cot = cot;
        _o = o;
    }

    public string Sheet { get; }

    /// <summary>Số dòng Excel.</summary>
    public int So { get; }

    public IReadOnlyList<string> LyDo => _lyDo;

    public void Loi(string lyDo) => _lyDo.Add(lyDo);

    public OExcel Tho(string cot) => _o.TryGetValue(cot, out var o) ? o : default;

    public string? Chu(string cot, bool? batBuoc = null, int? doDai = null, string? nhan = null)
    {
        if (!Co(cot, batBuoc, nhan, out var o, out var ten))
        {
            return null;
        }

        return KiemDoDai(ChuCua(o), doDai ?? Cot(cot).DoDai, ten);
    }

    /// <summary>Chữ dạng mã (mã thủ tục, mã DVC, điện thoại…): ô kiểu số là lỗi.</summary>
    public string? Ma(string cot, bool? batBuoc = null, int? doDai = null, string? nhan = null)
    {
        if (!Co(cot, batBuoc, nhan, out var o, out var ten))
        {
            return null;
        }

        if (o.Loai != LoaiO.Chu)
        {
            Loi(Chuoi.Dinh(ThongBao.OMaSo, ten));
            return null;
        }

        return KiemDoDai(o.Chu, doDai ?? Cot(cot).DoDai, ten);
    }

    public bool DanhDau(string cot, string? nhan = null)
    {
        if (!Co(cot, false, nhan, out var o, out var ten))
        {
            return false;
        }

        if (o.Loai == LoaiO.Chu && string.Equals(o.Chu, "x", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        Loi(Chuoi.Dinh(ThongBao.ODanhDau, ten, Hien(o)));
        return false;
    }

    /// <summary>Trả về giá trị chuẩn trong danh sách lựa chọn của cột, hoặc null nếu trống/sai.</summary>
    public string? LuaChon(string cot, bool? batBuoc = null, string? nhan = null)
    {
        if (!Co(cot, batBuoc, nhan, out var o, out var ten))
        {
            return null;
        }

        var danhSach = Cot(cot).LuaChon ?? [];
        var chuan = TiengViet.ChuanHoaTimKiem(ChuCua(o));
        var khop = danhSach.FirstOrDefault(g => TiengViet.ChuanHoaTimKiem(g) == chuan);
        if (khop is null)
        {
            Loi(Chuoi.Dinh(ThongBao.OLuaChon, ten, Hien(o), string.Join(", ", danhSach)));
        }

        return khop;
    }

    /// <summary>Số nguyên dương (&gt; 0).</summary>
    public int? SoDuong(string cot, bool? batBuoc = null, string? nhan = null)
        => SoNguyen(cot, batBuoc, nhan, 1, ThongBao.OSoDuong);

    /// <summary>Số nguyên không âm (&gt;= 0).</summary>
    public int? SoKhongAm(string cot, bool? batBuoc = null, string? nhan = null)
        => SoNguyen(cot, batBuoc, nhan, 0, ThongBao.OSoKhongAm);

    public TimeOnly? Gio(string cot, bool? batBuoc = null, string? nhan = null)
    {
        if (!Co(cot, batBuoc, nhan, out var o, out var ten))
        {
            return null;
        }

        var gio = DocGio(o);
        if (gio is null)
        {
            Loi(Chuoi.Dinh(ThongBao.OGio, ten, Hien(o)));
        }

        return gio;
    }

    /// <summary>Danh sách trong ô, phân cách bằng <c>;</c> hoặc xuống dòng; bỏ phần tử trống.</summary>
    public string[] DanhSach(string cot, bool? batBuoc = null, int? doDai = null, string? nhan = null)
        => LayDanhSach(cot, batBuoc, doDai, nhan, soLaLoi: false);

    /// <summary>Như <see cref="DanhSach"/> nhưng ô kiểu số là lỗi (danh sách mã).</summary>
    public string[] DanhSachMa(string cot, bool? batBuoc = null, int? doDai = null, string? nhan = null)
        => LayDanhSach(cot, batBuoc, doDai, nhan, soLaLoi: true);

    public string? Url(string cot, bool? batBuoc = null, string? nhan = null)
    {
        if (!Co(cot, batBuoc, nhan, out var o, out var ten))
        {
            return null;
        }

        var s = ChuCua(o);
        if (s.Length > MauExcel.DoDaiUrl)
        {
            Loi(Chuoi.Dinh(ThongBao.OQuaDai, ten, MauExcel.DoDaiUrl));
            return s;
        }

        if (!LaUrlHopLe(s))
        {
            Loi(Chuoi.Dinh(ThongBao.OUrl, ten, Hien(o)));
        }

        return s;
    }

    public string? Email(string cot, bool? batBuoc = null, string? nhan = null)
    {
        if (!Co(cot, batBuoc, nhan, out var o, out var ten))
        {
            return null;
        }

        var s = ChuCua(o);
        if (!LaEmailHopLe(s))
        {
            Loi(Chuoi.Dinh(ThongBao.OEmail, ten, Hien(o)));
        }

        return s;
    }

    public string? DienThoai(string cot, bool? batBuoc = null, string? nhan = null)
    {
        if (!Co(cot, batBuoc, nhan, out var o, out var ten))
        {
            return null;
        }

        if (o.Loai != LoaiO.Chu)
        {
            Loi(Chuoi.Dinh(ThongBao.OMaSo, ten));
            return null;
        }

        if (!LaDienThoaiHopLe(o.Chu))
        {
            Loi(Chuoi.Dinh(ThongBao.ODienThoai, ten, Hien(o)));
        }

        return o.Chu;
    }

    /// <summary>Địa chỉ web tuyệt đối, chỉ <c>http</c> hoặc <c>https</c>; mọi dạng khác (javascript:, data:, đường dẫn tương đối) bị chặn.</summary>
    public static bool LaUrlHopLe(string s)
    {
        if (string.IsNullOrEmpty(s) || s.Length > MauExcel.DoDaiUrl || s.Any(char.IsWhiteSpace))
        {
            return false;
        }

        return Uri.TryCreate(s, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
            && !string.IsNullOrEmpty(uri.Host)
            && s.StartsWith(uri.Scheme + "://", StringComparison.OrdinalIgnoreCase);
    }

    public static bool LaEmailHopLe(string s)
    {
        if (string.IsNullOrEmpty(s) || s.Length > MauExcel.DoDaiEmail || s.Any(char.IsWhiteSpace))
        {
            return false;
        }

        var at = s.IndexOf('@', StringComparison.Ordinal);
        return at > 0 && at == s.LastIndexOf('@') && at < s.Length - 1;
    }

    public static bool LaDienThoaiHopLe(string s)
    {
        if (string.IsNullOrEmpty(s) || s.Length > MauExcel.DoDaiDienThoai || !DienThoaiMau().IsMatch(s))
        {
            return false;
        }

        var soChuSo = s.Count(char.IsAsciiDigit);
        return soChuSo is >= 8 and <= 15;
    }

    private int? SoNguyen(string cot, bool? batBuoc, string? nhan, int nhoNhat, string mauLoi)
    {
        if (!Co(cot, batBuoc, nhan, out var o, out var ten))
        {
            return null;
        }

        int? ketQua = null;
        if (o.Loai == LoaiO.So)
        {
            if (o.So >= nhoNhat && o.So <= int.MaxValue && Math.Floor(o.So) == o.So)
            {
                ketQua = (int)o.So;
            }
        }
        else if (o.Loai == LoaiO.Chu
            && ChiChuSo().IsMatch(o.Chu)
            && int.TryParse(o.Chu, NumberStyles.None, CultureInfo.InvariantCulture, out var v)
            && v >= nhoNhat)
        {
            ketQua = v;
        }

        if (ketQua is null)
        {
            Loi(Chuoi.Dinh(mauLoi, ten, Hien(o)));
        }

        return ketQua;
    }

    private string[] LayDanhSach(string cot, bool? batBuoc, int? doDai, string? nhan, bool soLaLoi)
    {
        var ten = nhan ?? cot;
        var bb = batBuoc ?? Cot(cot).BatBuoc;
        if (!Co(cot, false, nhan, out var o, out _))
        {
            if (o.Loai == LoaiO.Trong && bb)
            {
                Loi(Chuoi.Dinh(ThongBao.OThieu, ten));
            }

            return [];
        }

        if (soLaLoi && o.Loai != LoaiO.Chu)
        {
            Loi(Chuoi.Dinh(ThongBao.OMaSo, ten));
            return [];
        }

        var gioiHan = doDai ?? Cot(cot).DoDai;
        var ketQua = ChuCua(o)
            .Split(DauTachDanhSach, StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);

        foreach (var phanTu in ketQua)
        {
            if (phanTu.Length > gioiHan)
            {
                Loi(Chuoi.Dinh(ThongBao.OQuaDai, ten, gioiHan));
                break;
            }
        }

        if (ketQua.Length == 0 && bb)
        {
            Loi(Chuoi.Dinh(ThongBao.OThieu, ten));
        }

        return ketQua;
    }

    /// <summary>Lấy ô; ghi lỗi nếu ô trống mà bắt buộc, hoặc ô lỗi công thức. Trả false khi không có giá trị dùng được.</summary>
    private bool Co(string cot, bool? batBuoc, string? nhan, out OExcel o, out string ten)
    {
        ten = nhan ?? cot;
        o = Tho(cot);

        if (o.Loai == LoaiO.LoiCongThuc)
        {
            Loi(Chuoi.Dinh(ThongBao.OCongThuc, ten, o.Chu));
            return false;
        }

        if (o.Loai == LoaiO.Trong)
        {
            if (batBuoc ?? Cot(cot).BatBuoc)
            {
                Loi(Chuoi.Dinh(ThongBao.OThieu, ten));
            }

            return false;
        }

        return true;
    }

    private CotMau Cot(string cot) => _cot.TryGetValue(cot, out var c)
        ? c
        : throw new ArgumentException($"Cột không có trong mẫu: {cot}", nameof(cot));

    private string KiemDoDai(string s, int doDai, string ten)
    {
        if (s.Length > doDai)
        {
            Loi(Chuoi.Dinh(ThongBao.OQuaDai, ten, doDai));
        }

        return s;
    }

    private static string ChuCua(OExcel o) => o.Loai switch
    {
        LoaiO.Chu => o.Chu,
        LoaiO.So => o.So.ToString("0.###############", CultureInfo.InvariantCulture),
        LoaiO.Gio => new TimeOnly(0, 0).Add(o.Gio).ToString("HH:mm", CultureInfo.InvariantCulture),
        LoaiO.Bool => o.So != 0 ? "TRUE" : "FALSE",
        _ => string.Empty,
    };

    private static string Hien(OExcel o)
    {
        var s = ChuCua(o).ReplaceLineEndings(" ");
        return s.Length <= DoDaiHienToiDa ? s : string.Concat(s.AsSpan(0, DoDaiHienToiDa), "…");
    }

    private static TimeOnly? DocGio(OExcel o)
    {
        TimeSpan? ts = null;
        switch (o.Loai)
        {
            case LoaiO.Gio:
                ts = o.Gio;
                break;
            case LoaiO.So when o.So >= 0 && o.So < 1:
                ts = TimeSpan.FromDays(o.So);
                break;
            case LoaiO.Chu:
                var m = GioMau().Match(o.Chu);
                if (m.Success
                    && int.Parse(m.Groups[1].Value, CultureInfo.InvariantCulture) is var h and < 24
                    && int.Parse(m.Groups[2].Value, CultureInfo.InvariantCulture) is var p and < 60)
                {
                    ts = new TimeSpan(h, p, 0);
                }

                break;
            default:
                break;
        }

        if (ts is null)
        {
            return null;
        }

        // Excel lưu giờ dạng phân số của ngày, nên làm tròn về phút để 07:00 không thành 06:59:59.
        var phut = (int)Math.Round(ts.Value.TotalMinutes);
        return phut is >= 0 and < 24 * 60 ? new TimeOnly(phut / 60, phut % 60) : null;
    }

    [GeneratedRegex(@"^\d+$", RegexOptions.CultureInvariant)]
    private static partial Regex ChiChuSo();

    [GeneratedRegex(@"^(\d{1,2}):(\d{2})$", RegexOptions.CultureInvariant)]
    private static partial Regex GioMau();

    [GeneratedRegex(@"^\+?[\d\s.\-()]+$", RegexOptions.CultureInvariant)]
    private static partial Regex DienThoaiMau();
}
