using System.IO.Compression;
using System.Text;
using ClosedXML.Excel;
using DichVuCong.Data.Text;
using DichVuCong.Import.KiemTra;
using DichVuCong.Import.Resources;

namespace DichVuCong.Import.Excel;

/// <summary>Lỗi mở file (không tìm thấy, sai đuôi, quá lớn, hỏng) — mã thoát 2.</summary>
internal sealed class LoiFileException(string thongBao) : Exception(thongBao);

internal sealed class SheetDoc(SheetMau mau, bool hopLe, IReadOnlyList<DongDoc> dong)
{
    public SheetMau Mau { get; } = mau;

    /// <summary>False khi sheet lỗi cấu trúc (thiếu sheet, thiếu cột, cột lạ); khi đó <see cref="Dong"/> rỗng.</summary>
    public bool HopLe { get; } = hopLe;

    public IReadOnlyList<DongDoc> Dong { get; } = dong;
}

internal sealed class FileDoc(string tenFile, IReadOnlyDictionary<string, SheetDoc> sheet, BoGomLoi loi)
{
    public string TenFile { get; } = tenFile;

    /// <summary>Lỗi cấu trúc và (sau khi kiểm) lỗi dòng của file.</summary>
    public BoGomLoi Loi { get; } = loi;

    public SheetDoc this[string tenSheet] => sheet[tenSheet];

    public bool HopLeCauTruc => sheet.Values.All(s => s.HopLe);
}

/// <summary>Mở file Excel an toàn, kiểm cấu trúc và đọc ô thành bảng dòng (plan F01 §3.1, §5.2 bước 1-3).</summary>
internal static class DocExcel
{
    private const string TenCotGhiChu = "Ghi chú";

    /// <summary>Kiểm đường dẫn: có file, đuôi .xlsx, không quá 20 MB. Ném <see cref="LoiFileException"/> nếu không đạt.</summary>
    public static void KiemTraDuongDan(string duongDan)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(duongDan);
        var ten = Path.GetFileName(duongDan);

        if (!File.Exists(duongDan))
        {
            throw new LoiFileException(Chuoi.Dinh(ThongBao.LoiFileKhongTim, duongDan));
        }

        if (!string.Equals(Path.GetExtension(duongDan), ".xlsx", StringComparison.OrdinalIgnoreCase))
        {
            throw new LoiFileException(Chuoi.Dinh(ThongBao.LoiFileDuoi, ten));
        }

        if (new FileInfo(duongDan).Length > MauExcel.DungLuongToiDa)
        {
            throw new LoiFileException(Chuoi.Dinh(ThongBao.LoiFileLon, ten, MauExcel.DungLuongToiDa / (1024 * 1024)));
        }
    }

    /// <summary>
    /// Mở file chỉ đọc, cho phép file đang mở trong Excel. Từ chối file có tổng dung lượng giải nén vượt
    /// <see cref="MauExcel.GiaiNenToiDa"/> (zip bomb). Ném <see cref="LoiFileException"/> nếu không dùng được.
    /// </summary>
    public static XLWorkbook Mo(string duongDan) => Mo(duongDan, MauExcel.GiaiNenToiDa);

    internal static XLWorkbook Mo(string duongDan, long giaiNenToiDa)
    {
        KiemTraDuongDan(duongDan);
        var ten = Path.GetFileName(duongDan);

        MemoryStream boNho;
        try
        {
            // Đọc hết vào bộ nhớ (tối đa 20 MB) rồi trả file lại ngay: ClosedXML còn đọc tiếp từ luồng khi cần,
            // nên không để nó giữ luồng file đang mở.
            using var luong = new FileStream(duongDan, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            boNho = new MemoryStream();
            luong.CopyTo(boNho);
            boNho.Position = 0;
        }
        catch (Exception e) when (e is not OperationCanceledException)
        {
            throw new LoiFileException(Chuoi.Dinh(ThongBao.LoiFileKhongMo, ten));
        }

        try
        {
            KiemTraGiaiNen(boNho, ten, giaiNenToiDa);
            boNho.Position = 0;
            return new XLWorkbook(boNho);
        }
        catch (LoiFileException)
        {
            boNho.Dispose();
            throw;
        }
        catch (Exception e) when (e is not OperationCanceledException)
        {
            boNho.Dispose();
            throw new LoiFileException(Chuoi.Dinh(ThongBao.LoiFileKhongMo, ten));
        }
    }

    /// <summary>Cộng dung lượng giải nén khai trong thư mục zip của .xlsx; vượt <paramref name="toiDa"/> thì ném <see cref="LoiFileException"/>.</summary>
    private static void KiemTraGiaiNen(Stream luong, string ten, long toiDa)
    {
        using var zip = new ZipArchive(luong, ZipArchiveMode.Read, leaveOpen: true);
        long tong = 0;
        foreach (var muc in zip.Entries)
        {
            tong += muc.Length;
            if (tong > toiDa)
            {
                throw new LoiFileException(Chuoi.Dinh(ThongBao.LoiFileGiaiNenLon, ten, toiDa / (1024 * 1024)));
            }
        }
    }

    /// <summary>Kiểm cấu trúc và đọc mọi sheet của <paramref name="mau"/>. Lỗi cấu trúc ghi vào <see cref="FileDoc.Loi"/>, theo sheet.</summary>
    public static FileDoc Doc(XLWorkbook sach, FileMau mau, string tenFile)
    {
        ArgumentNullException.ThrowIfNull(sach);
        ArgumentNullException.ThrowIfNull(mau);

        var loi = new BoGomLoi();

        var ketQua = new Dictionary<string, SheetDoc>();
        foreach (var sheetMau in mau.Sheet)
        {
            var ws = sach.Worksheets.FirstOrDefault(w => MauExcel.SoKhop(w.Name, sheetMau.Ten));
            if (ws is null)
            {
                loi.Them(sheetMau.Ten, null, Chuoi.Dinh(ThongBao.CauTrucThieuSheet, sheetMau.Ten));
                ketQua[sheetMau.Ten] = new SheetDoc(sheetMau, false, []);
                continue;
            }

            ketQua[sheetMau.Ten] = DocSheet(ws, sheetMau, loi);
        }

        return new FileDoc(tenFile, ketQua, loi);
    }

    /// <summary>
    /// Làm sạch chữ (BR-18): NFC; bỏ ký tự vô hình (cùng bộ với ô tìm kiếm); bỏ ký tự điều khiển trừ xuống dòng và tab;
    /// CRLF thành LF; trim. Ô chỉ có khoảng trắng thành chuỗi rỗng.
    /// </summary>
    public static string LamSach(string chuoi)
    {
        ArgumentNullException.ThrowIfNull(chuoi);

        var s = TiengViet.BoKyTuVoHinh(chuoi.Normalize(NormalizationForm.FormC))
            .Replace("\r\n", "\n", StringComparison.Ordinal)
            .Replace('\r', '\n');

        var sb = new StringBuilder(s.Length);
        foreach (var c in s)
        {
            if (!char.IsControl(c) || c is '\n' or '\t')
            {
                sb.Append(c);
            }
        }

        return sb.ToString().Trim();
    }

    /// <summary>
    /// Bỏ tiền tố danh sách (<c>-</c>, <c>+</c>, <c>•</c> và khoảng trắng sau nó) ở đầu mục: nguồn hay chép dấu gạch đầu dòng
    /// vào tên giấy tờ, kết quả, bước trình tự, khiến giao diện hiện "1. - Tên". Phần còn lại giữ nguyên.
    /// Chuỗi chỉ gồm tiền tố thì trả về nguyên văn (không biến thành rỗng).
    /// </summary>
    public static string BoTienToDanhSach(string chuoi)
    {
        ArgumentNullException.ThrowIfNull(chuoi);

        var con = chuoi.TrimStart();
        if (con.Length == 0 || con[0] is not ('-' or '+' or '•'))
        {
            return chuoi;
        }

        // Lặp để bỏ cả "- - Tên" (nguồn chép dấu hai lần); dừng khi phần còn lại rỗng.
        while (con.Length > 0 && con[0] is '-' or '+' or '•')
        {
            var tiep = con[1..].TrimStart();
            if (tiep.Length == 0)
            {
                break;
            }

            con = tiep;
        }

        return con.Length == 1 && con[0] is '-' or '+' or '•' ? chuoi : con;
    }

    private static SheetDoc DocSheet(IXLWorksheet ws, SheetMau mau, BoGomLoi loi)
    {
        var cauTruc = new List<string>();
        var cotTheoSo = new Dictionary<int, CotMau>();
        var daCo = new HashSet<string>(StringComparer.Ordinal);

        var cotCuoi = ws.LastColumnUsed(XLCellsUsedOptions.Contents)?.ColumnNumber() ?? 0;
        var dongCuoi = ws.LastRowUsed(XLCellsUsedOptions.Contents)?.RowNumber() ?? 0;

        if (dongCuoi > MauExcel.SoDongToiDa)
        {
            loi.Them(mau.Ten, null, Chuoi.Dinh(ThongBao.CauTrucQuaNhieuDong, MauExcel.SoDongToiDa));
            return new SheetDoc(mau, false, []);
        }

        for (var c = 1; c <= cotCuoi; c++)
        {
            var tieuDe = LamSach(ws.Cell(1, c).GetFormattedString());
            if (tieuDe.Length == 0 || MauExcel.SoKhop(tieuDe, TenCotGhiChu))
            {
                continue;
            }

            var cot = mau.TimCot(tieuDe);
            if (cot is null)
            {
                cauTruc.Add(Chuoi.Dinh(ThongBao.CauTrucCotLa, tieuDe));
            }
            else if (!daCo.Add(cot.Ten))
            {
                cauTruc.Add(Chuoi.Dinh(ThongBao.CauTrucCotTrung, cot.Ten));
            }
            else
            {
                cotTheoSo[c] = cot;
            }
        }

        var thieu = mau.Cot.Where(c => !daCo.Contains(c.Ten)).Select(c => $"\"{c.Ten}\"").ToArray();
        if (thieu.Length > 0)
        {
            cauTruc.Add(Chuoi.Dinh(ThongBao.CauTrucThieuCot, string.Join(", ", thieu)));
        }

        if (cauTruc.Count > 0)
        {
            loi.Them(mau.Ten, null, string.Join("; ", cauTruc));
            return new SheetDoc(mau, false, []);
        }

        var cotTheoTen = mau.Cot.ToDictionary(c => c.Ten, StringComparer.Ordinal);
        var dong = new List<DongDoc>();
        for (var r = 2; r <= dongCuoi; r++)
        {
            var o = new Dictionary<string, OExcel>(cotTheoSo.Count, StringComparer.Ordinal);
            var trong = true;
            foreach (var (c, cot) in cotTheoSo)
            {
                var gia = DocO(ws.Cell(r, c));
                o[cot.Ten] = gia;
                trong &= gia.Loai == LoaiO.Trong;
            }

            if (!trong)
            {
                dong.Add(new DongDoc(mau.Ten, r, cotTheoTen, o));
            }
        }

        return new SheetDoc(mau, true, dong);
    }

    private static OExcel DocO(IXLCell o)
    {
        // Công thức: dùng giá trị đã lưu trong file, không tính lại.
        var v = o.HasFormula ? o.CachedValue : o.Value;

        if (v.IsBlank)
        {
            return default;
        }

        if (v.IsError)
        {
            return new OExcel(LoaiO.LoiCongThuc, v.GetError().ToString());
        }

        if (v.IsText)
        {
            var s = LamSach(v.GetText());
            return s.Length == 0 ? default : new OExcel(LoaiO.Chu, s);
        }

        if (v.IsNumber)
        {
            return new OExcel(LoaiO.So, So: v.GetNumber());
        }

        if (v.IsBoolean)
        {
            return new OExcel(LoaiO.Bool, So: v.GetBoolean() ? 1 : 0);
        }

        if (v.IsTimeSpan)
        {
            return new OExcel(LoaiO.Gio, Gio: v.GetTimeSpan());
        }

        if (v.IsDateTime)
        {
            var ngay = v.GetDateTime();
            // Ô giờ của Excel (chỉ có phần giờ) được ClosedXML đọc thành ngày gốc 1899/1900.
            return ngay.Year <= 1900
                ? new OExcel(LoaiO.Gio, Gio: ngay.TimeOfDay)
                : new OExcel(LoaiO.Chu, ngay.ToString("yyyy-MM-dd HH:mm", System.Globalization.CultureInfo.InvariantCulture));
        }

        return default;
    }
}
