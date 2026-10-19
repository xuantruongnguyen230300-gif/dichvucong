using System.Text;
using System.Text.RegularExpressions;
using DichVuCong.Data.Entities;

namespace DichVuCong.Api.Features.Chatbot;

/// <summary>
/// Che số CCCD/CMND, số điện thoại, email trong câu hỏi (F06 BR-8, plan §4.8). Hai bản cùng bộ mẫu:
/// <see cref="Che"/> để lưu (giữ hai chữ số đầu và cuối), <see cref="Bo"/> để so khớp (thay bằng một dấu cách).
/// Thứ tự áp: email, rồi dãy chữ số.
/// </summary>
/// <remarks>
/// Dãy chữ số: các nhóm chữ số nối nhau bằng một dấu ngăn (khoảng trắng, <c>-</c>, <c>.</c>, ngoặc); mã thủ tục dạng
/// <c>1.001193[.xxx…]</c> được bỏ qua trước. Trong mỗi dãy, tìm cửa sổ nhóm liền nhau dài nhất có số chữ số thuộc một trong:
/// 10–11 chữ số bắt đầu 0 (điện thoại), 11–12 bắt đầu 84 (điện thoại có mã nước), 12 (CCCD), 9 (CMND). Quyết định theo
/// số chữ số, không theo cách chia nhóm.
/// Giới hạn đã biết: số tiền viết kiểu <c>100.000.000</c> (nhóm 3, không bắt đầu 0) được coi là tiền nên không che;
/// dãy 9 hoặc 12 chữ số khác (kể cả liệt kê <c>1 2 3 4 5 6 7 8 9</c>) bị che; số điện thoại viết bằng chữ ("không chín một…")
/// và tên người, địa chỉ không bị che.
/// </remarks>
public static partial class CheThongTinCaNhan
{
    private const int SoChuSoGiuMoiDau = 2;
    private const int SoChuSoNhieuNhat = 12;
    private const int SoChuSoCmnd = 9;
    private const int SoChuSoDienThoaiNgan = 10;
    private const int SoChuSoDienThoaiDai = 11;
    private const int SoChuSoCccd = 12;
    private const int SoChuSoNhomTien = 3;

    /// <summary>Bản để lưu: email thành <c>n***@gmail.com</c>, số thành <c>09******78</c>; cắt về tối đa <see cref="CauChuaTraLoi.DoDaiToiDa"/> ký tự.</summary>
    public static string Che(string cau)
    {
        ArgumentNullException.ThrowIfNull(cau);

        var ketQua = Ap(cau, laBanLuu: true);

        return CatDoDai(ketQua, CauChuaTraLoi.DoDaiToiDa);
    }

    /// <summary>Bản để so khớp: mỗi chỗ khớp thành đúng một dấu cách.</summary>
    public static string Bo(string cau)
    {
        ArgumentNullException.ThrowIfNull(cau);

        return Ap(cau, laBanLuu: false);
    }

    private static string Ap(string cau, bool laBanLuu)
    {
        try
        {
            var buoc1 = Email().Replace(cau, laBanLuu ? CheEmail : ThayDauCach);

            return DayChuSo().Replace(buoc1, m => m.Groups["ma"].Success ? m.Value : XuLyDay(m.Value, laBanLuu));
        }
        catch (RegexMatchTimeoutException)
        {
            // Không bao giờ để lọt: không biết đâu là số thì coi mọi chữ số và dấu @ là cần che.
            return LamMuTatCa(cau, laBanLuu);
        }
    }

    private static string ThayDauCach(Match m) => " ";

    private static string CheEmail(Match m)
    {
        var s = m.Value;
        var at = s.IndexOf('@', StringComparison.Ordinal);

        return string.Concat(s.AsSpan(0, 1), "***", s.AsSpan(at));
    }

    private readonly record struct Nhom(int Dau, int Dai);

    /// <summary>Xử lý một dãy nhóm chữ số: che mọi cửa sổ liền nhau (dài nhất trước) có dạng số nhạy cảm, giữ nguyên phần còn lại.</summary>
    private static string XuLyDay(string day, bool laBanLuu)
    {
        var nhom = TachNhom(day, out var chuSo);
        if (chuSo.Length < SoChuSoCmnd)
        {
            return day;
        }

        // truoc[k] = số chữ số của k nhóm đầu → cửa sổ [i..j] có truoc[j+1] - truoc[i] chữ số.
        var truoc = new int[nhom.Count + 1];
        for (var k = 0; k < nhom.Count; k++)
        {
            truoc[k + 1] = truoc[k] + nhom[k].Dai;
        }

        var ketQua = new StringBuilder(day.Length);
        var viTri = 0;
        var i = 0;
        while (i < nhom.Count)
        {
            var j = TimCuaSoDaiNhat(day, nhom, chuSo, truoc, i);
            if (j < 0)
            {
                i++;
                continue;
            }

            ketQua.Append(day, viTri, nhom[i].Dau - viTri);
            if (laBanLuu)
            {
                AppendChuSoDaChe(ketQua, chuSo.AsSpan(truoc[i], truoc[j + 1] - truoc[i]));
            }
            else
            {
                ketQua.Append(' ');
            }

            viTri = nhom[j].Dau + nhom[j].Dai;
            i = j + 1;
        }

        ketQua.Append(day, viTri, day.Length - viTri);

        return ketQua.ToString();
    }

    private static List<Nhom> TachNhom(string day, out char[] chuSo)
    {
        var nhom = new List<Nhom>();
        var soChuSo = new List<char>(day.Length);
        var i = 0;
        while (i < day.Length)
        {
            if (!char.IsAsciiDigit(day[i]))
            {
                i++;
                continue;
            }

            var dau = i;
            while (i < day.Length && char.IsAsciiDigit(day[i]))
            {
                soChuSo.Add(day[i]);
                i++;
            }

            nhom.Add(new Nhom(dau, i - dau));
        }

        chuSo = [.. soChuSo];

        return nhom;
    }

    /// <summary>Chỉ số nhóm cuối của cửa sổ dài nhất bắt đầu ở nhóm <paramref name="i"/> là số nhạy cảm; -1 nếu không có.</summary>
    private static int TimCuaSoDaiNhat(string day, List<Nhom> nhom, char[] chuSo, int[] truoc, int i)
    {
        for (var j = nhom.Count - 1; j >= i; j--)
        {
            var dem = truoc[j + 1] - truoc[i];
            if (dem is < SoChuSoCmnd or > SoChuSoCccd)
            {
                continue;
            }

            if (LaSoNhayCam(dem, chuSo.AsSpan(truoc[i], dem)) && !(dem is SoChuSoCmnd or SoChuSoCccd && LaSoTien(day, nhom, i, j)))
            {
                return j;
            }
        }

        return -1;
    }

    private static bool LaSoNhayCam(int dem, ReadOnlySpan<char> chuSo)
    {
        if (dem is SoChuSoCmnd or SoChuSoCccd)
        {
            return true;
        }

        if (dem is SoChuSoDienThoaiNgan or SoChuSoDienThoaiDai && chuSo[0] == '0')
        {
            return true;
        }

        return dem is SoChuSoDienThoaiDai or SoChuSoCccd && chuSo[0] == '8' && chuSo[1] == '4';
    }

    /// <summary>
    /// Số tiền kiểu <c>100.000.000</c>: chuỗi nhóm nối bằng dấu chấm, nhóm đầu 1–3 chữ số không bắt đầu 0, các nhóm sau đúng 3 chữ số.
    /// Cửa sổ nằm giữa chuỗi (vd. 9 chữ số cuối của <c>1.000.000.000</c>) cũng tính: lùi về nhóm đầu chuỗi rồi kiểm.
    /// </summary>
    private static bool LaSoTien(string day, List<Nhom> nhom, int i, int j)
    {
        var dau = i;
        while (dau > 0 && NoiBangDauChamNhom3(day, nhom, dau))
        {
            dau--;
        }

        if (j == dau || day[nhom[dau].Dau] == '0' || nhom[dau].Dai > SoChuSoNhomTien)
        {
            return false;
        }

        for (var k = dau + 1; k <= j; k++)
        {
            if (!NoiBangDauChamNhom3(day, nhom, k))
            {
                return false;
            }
        }

        return true;
    }

    /// <summary>Nhóm <paramref name="k"/> có đúng 3 chữ số và nối với nhóm trước bằng một dấu chấm.</summary>
    private static bool NoiBangDauChamNhom3(string day, List<Nhom> nhom, int k) =>
        nhom[k].Dai == SoChuSoNhomTien
        && day[nhom[k].Dau - 1] == '.'
        && nhom[k - 1].Dau + nhom[k - 1].Dai == nhom[k].Dau - 1;

    private static void AppendChuSoDaChe(StringBuilder ketQua, ReadOnlySpan<char> chuSo)
    {
        var giu = Math.Min(SoChuSoGiuMoiDau, chuSo.Length / 2);
        for (var i = 0; i < chuSo.Length; i++)
        {
            ketQua.Append(i < giu || i >= chuSo.Length - giu ? chuSo[i] : '*');
        }
    }

    private static string LamMuTatCa(string cau, bool laBanLuu)
    {
        var thay = laBanLuu ? '*' : ' ';
        var ketQua = new StringBuilder(cau.Length);
        foreach (var c in cau)
        {
            ketQua.Append(char.IsAsciiDigit(c) || c == '@' ? thay : c);
        }

        return ketQua.ToString();
    }

    private static string CatDoDai(string cau, int toiDa)
    {
        if (cau.Length <= toiDa)
        {
            return cau;
        }

        // Không cắt giữa cặp surrogate.
        var doDai = char.IsHighSurrogate(cau[toiDa - 1]) ? toiDa - 1 : toiDa;

        return cau[..doDai];
    }

    [GeneratedRegex(@"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}", RegexOptions.CultureInvariant, matchTimeoutMilliseconds: 100)]
    private static partial Regex Email();

    // Nhánh "ma": mã thủ tục 1.001193[.02|.000.00.00][.H53] — khớp trước để không bị gộp vào dãy số.
    // Nhánh dãy số: nhóm chữ số nối nhau bằng đúng một dấu ngăn; các nhánh rời nhau nên không quay lui bậc hai.
    [GeneratedRegex(
        @"(?<ma>(?<!\d)\d\.\d{6}(?:\.\d{2,3}){0,4}(?:\.[A-Z]\d{2})?(?!\d))|(?<!\d)\d+(?:(?:[ .\-]\(?|\)[ .\-]?|\()\d+)*",
        RegexOptions.CultureInvariant,
        matchTimeoutMilliseconds: 100)]
    private static partial Regex DayChuSo();
}
