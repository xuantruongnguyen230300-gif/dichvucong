using DichVuCong.Data.Text;

namespace DichVuCong.Api.Features.Chatbot.TimKiem;

/// <summary>
/// Nhóm hàm so khớp chuỗi của trợ lý, gom một nơi (plan F06 §4). Mọi so khớp chạy trên <b>dãy từ</b>: chuỗi qua
/// <see cref="TiengViet.ChuanHoaTimKiem"/> rồi tách ở mọi ký tự ngoài <c>[a-z0-9]</c>. So khớp theo từ nguyên,
/// không theo chuỗi con ("cuoi" không khớp trong "cuoi cung"; "phi" khác "phien"), bằng so sánh <c>Ordinal</c> từng từ,
/// nên không cần <c>StartsWith</c>/<c>EndsWith</c>/<c>Contains</c> trên chuỗi (R4 — không có ngoại lệ nào phải ghi).
/// </summary>
internal static class ChuoiTu
{
    /// <summary>Chuẩn hoá rồi tách thành các từ gồm chữ thường không dấu và chữ số.</summary>
    public static string[] Tach(string chuoi)
    {
        ArgumentNullException.ThrowIfNull(chuoi);

        return TachDaChuanHoa(TiengViet.ChuanHoaTimKiem(chuoi));
    }

    /// <summary>Tách chuỗi đã qua <see cref="TiengViet.ChuanHoaTimKiem"/>.</summary>
    public static string[] TachDaChuanHoa(string chuanHoa)
    {
        var tu = new List<string>();
        var dau = -1;
        for (var i = 0; i <= chuanHoa.Length; i++)
        {
            var laChu = i < chuanHoa.Length && (char.IsAsciiLetterLower(chuanHoa[i]) || char.IsAsciiDigit(chuanHoa[i]));
            if (laChu)
            {
                if (dau < 0)
                {
                    dau = i;
                }
            }
            else if (dau >= 0)
            {
                tu.Add(chuanHoa[dau..i]);
                dau = -1;
            }
        }

        return [.. tu];
    }

    /// <summary>Dãy <paramref name="kim"/> nằm liền nhau trong <paramref name="hay"/> bắt đầu đúng ở <paramref name="viTri"/>.</summary>
    public static bool KhopTai(IReadOnlyList<string> hay, int viTri, IReadOnlyList<string> kim)
    {
        if (kim.Count == 0 || viTri < 0 || viTri + kim.Count > hay.Count)
        {
            return false;
        }

        for (var j = 0; j < kim.Count; j++)
        {
            if (!string.Equals(hay[viTri + j], kim[j], StringComparison.Ordinal))
            {
                return false;
            }
        }

        return true;
    }

    /// <summary>Dãy <paramref name="kim"/> kết thúc đúng ở <paramref name="viTriCuoi"/> (tính cả).</summary>
    public static bool KhopDenHet(IReadOnlyList<string> hay, int viTriCuoi, IReadOnlyList<string> kim)
        => KhopTai(hay, viTriCuoi - kim.Count + 1, kim);

    /// <summary>Vị trí đầu tiên của dãy <paramref name="kim"/> trong <paramref name="hay"/> từ <paramref name="tuViTri"/>; -1 nếu không có.</summary>
    public static int TimDay(IReadOnlyList<string> hay, IReadOnlyList<string> kim, int tuViTri = 0)
    {
        for (var i = Math.Max(0, tuViTri); i + kim.Count <= hay.Count; i++)
        {
            if (KhopTai(hay, i, kim))
            {
                return i;
            }
        }

        return -1;
    }

    public static bool ChuaDay(IReadOnlyList<string> hay, IReadOnlyList<string> kim) => TimDay(hay, kim) >= 0;

    /// <summary>Mọi vị trí bắt đầu của dãy <paramref name="kim"/> trong <paramref name="hay"/>.</summary>
    public static IEnumerable<int> MoiViTri(IReadOnlyList<string> hay, IReadOnlyList<string> kim)
    {
        for (var i = TimDay(hay, kim); i >= 0; i = TimDay(hay, kim, i + 1))
        {
            yield return i;
        }
    }

    /// <summary>
    /// Thay dãy theo <paramref name="bang"/>: quét từ trái sang phải, tại mỗi vị trí khớp dãy dài nhất trước
    /// ("đám cưới" thắng "cưới"), dãy đã thay không bị xét lại.
    /// </summary>
    public static string[] ThayDay(IReadOnlyList<string> hay, BangThayDay bang)
    {
        ArgumentNullException.ThrowIfNull(bang);

        var ketQua = new List<string>(hay.Count);
        var i = 0;
        while (i < hay.Count)
        {
            var luat = bang.TimTai(hay, i);
            if (luat is null)
            {
                ketQua.Add(hay[i]);
                i++;
            }
            else
            {
                ketQua.AddRange(luat.Thay);
                i += luat.Tu.Length;
            }
        }

        return [.. ketQua];
    }
}

/// <summary>Một luật: dãy từ <see cref="Tu"/> được thay bằng dãy <see cref="Thay"/>.</summary>
internal sealed record LuatThayDay(string[] Tu, string[] Thay);

/// <summary>Tập luật thay dãy, tra theo từ đầu. Hai luật cùng dãy nguồn: luật thêm vào trước được giữ.</summary>
internal sealed class BangThayDay
{
    private readonly Dictionary<string, List<LuatThayDay>> _theoTuDau = new(StringComparer.Ordinal);

    public int SoLuat { get; private set; }

    public void Them(string[] tu, string[] thay)
    {
        if (tu.Length == 0)
        {
            return;
        }

        if (!_theoTuDau.TryGetValue(tu[0], out var ds))
        {
            ds = [];
            _theoTuDau.Add(tu[0], ds);
        }

        if (ds.Any(l => l.Tu.AsSpan().SequenceEqual(tu)))
        {
            return;
        }

        ds.Add(new LuatThayDay(tu, thay));
        SoLuat++;
    }

    /// <summary>Luật dài nhất khớp tại <paramref name="viTri"/>; null nếu không có.</summary>
    public LuatThayDay? TimTai(IReadOnlyList<string> hay, int viTri)
    {
        if (!_theoTuDau.TryGetValue(hay[viTri], out var ds))
        {
            return null;
        }

        LuatThayDay? tot = null;
        foreach (var luat in ds)
        {
            if ((tot is null || luat.Tu.Length > tot.Tu.Length) && ChuoiTu.KhopTai(hay, viTri, luat.Tu))
            {
                tot = luat;
            }
        }

        return tot;
    }
}
