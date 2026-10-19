using System.Globalization;
using ClosedXML.Excel;
using DichVuCong.Data.Entities;
using DichVuCong.Import.Resources;

namespace DichVuCong.Import.Excel;

/// <summary>Dùng để ghi từng dòng vào một sheet của file mẫu, theo tên cột của <see cref="MauExcel"/>.</summary>
internal sealed class BangGhi(IXLWorksheet ws, SheetMau mau)
{
    // Ghi tiếp sau dòng cuối đã có dữ liệu (dòng 1 là tiêu đề), để nhiều BangGhi cùng sheet không ghi đè nhau.
    private int _dong = Math.Max(1, ws.LastRowUsed(XLCellsUsedOptions.Contents)?.RowNumber() ?? 1);

    /// <summary>Thêm một dòng. Giá trị null hoặc chuỗi rỗng để ô trống; <c>bool</c> true ghi "x".</summary>
    public void Them(params (string Cot, object? GiaTri)[] gia)
    {
        _dong++;
        foreach (var (cot, giaTri) in gia)
        {
            var chiSo = DemCotTruoc(cot);
            var o = ws.Cell(_dong, chiSo + 1);
            switch (giaTri)
            {
                case null:
                    break;
                case string s when s.Length == 0:
                    break;
                case string s:
                    o.Value = s;
                    break;
                case bool b:
                    if (b)
                    {
                        o.Value = "x";
                    }

                    break;
                case int i:
                    o.Value = i;
                    break;
                case TimeOnly t:
                    o.Value = t.ToString("HH:mm", CultureInfo.InvariantCulture);
                    break;
                default:
                    throw new ArgumentException($"Kiểu giá trị không hỗ trợ: {giaTri.GetType().Name}", nameof(gia));
            }
        }
    }

    private int DemCotTruoc(string cot)
    {
        for (var i = 0; i < mau.Cot.Count; i++)
        {
            if (mau.Cot[i].Ten == cot)
            {
                return i;
            }
        }

        throw new ArgumentException($"Cột không có trong mẫu: {cot}", nameof(cot));
    }
}

/// <summary>Tạo workbook theo <see cref="MauExcel"/> (tao-mau, xuat, DuLieuMau).</summary>
internal static class GhiExcel
{
    /// <summary>Số dòng được đặt định dạng và danh sách chọn sẵn.</summary>
    private const int SoDongMau = 5000;

    private const double DoRongCotChu = 40;
    private const double DoRongCotNgan = 22;

    /// <summary>
    /// File mẫu: dòng tiêu đề, cột chữ định dạng Text (để Excel không hiểu "- Tờ khai" là công thức, không bỏ số 0 đầu),
    /// danh sách chọn, sheet "Hướng dẫn". <paramref name="dienSan"/>: điền sẵn tên mục Trung tâm và 7 thứ.
    /// </summary>
    public static XLWorkbook TaoMau(FileMau mau, bool dienSan = true)
    {
        ArgumentNullException.ThrowIfNull(mau);

        var sach = new XLWorkbook();
        foreach (var sheet in mau.Sheet)
        {
            var ws = sach.AddWorksheet(sheet.Ten);
            for (var i = 0; i < sheet.Cot.Count; i++)
            {
                DatCot(ws, i + 1, sheet.Cot[i]);
            }

            ws.SheetView.FreezeRows(1);
        }

        if (dienSan)
        {
            DienSan(sach, mau);
        }

        ThemHuongDan(sach, mau);
        return sach;
    }

    public static BangGhi Bang(XLWorkbook sach, SheetMau mau)
    {
        ArgumentNullException.ThrowIfNull(sach);
        ArgumentNullException.ThrowIfNull(mau);
        return new BangGhi(sach.Worksheet(mau.Ten), mau);
    }

    public static void LuuMoi(XLWorkbook sach, string duongDan)
    {
        ArgumentNullException.ThrowIfNull(sach);
        using var luong = new FileStream(duongDan, FileMode.CreateNew, FileAccess.ReadWrite, FileShare.None);
        sach.SaveAs(luong);
    }

    public static void LuuDe(XLWorkbook sach, string duongDan)
    {
        ArgumentNullException.ThrowIfNull(sach);
        using var luong = new FileStream(duongDan, FileMode.Create, FileAccess.ReadWrite, FileShare.None);
        sach.SaveAs(luong);
    }

    /// <summary>File xuất câu chưa trả lời: 3 cột; ô câu hỏi luôn là chuỗi, không bao giờ là công thức (plan F01 §10).</summary>
    public static XLWorkbook TaoXuat(IEnumerable<CauChuaTraLoi> cau)
    {
        ArgumentNullException.ThrowIfNull(cau);

        var gioVn = TimeSpan.FromHours(7);
        var sach = new XLWorkbook();
        var ws = sach.AddWorksheet(ThongBao.XuatTenSheet);

        string[] tieuDe = [ThongBao.XuatCotCauHoi, ThongBao.XuatCotSoLanGap, ThongBao.XuatCotLanGapCuoi];
        for (var i = 0; i < tieuDe.Length; i++)
        {
            ws.Cell(1, i + 1).Value = tieuDe[i];
            ws.Cell(1, i + 1).Style.Font.Bold = true;
        }

        var dong = 1;
        foreach (var c in cau)
        {
            dong++;
            ws.Cell(dong, 1).Value = c.NoiDung;
            ws.Cell(dong, 1).Style.NumberFormat.Format = "@";
            ws.Cell(dong, 2).Value = c.SoLanGap;
            ws.Cell(dong, 3).Value = c.LanGapCuoi.ToOffset(gioVn).ToString("dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
        }

        ws.Column(1).Width = 80;
        ws.Column(2).Width = 14;
        ws.Column(3).Width = 20;
        ws.SheetView.FreezeRows(1);
        return sach;
    }

    private static void DatCot(IXLWorksheet ws, int so, CotMau cot)
    {
        var tieuDe = ws.Cell(1, so);
        tieuDe.Value = cot.Ten;
        tieuDe.Style.Font.Bold = true;
        tieuDe.Style.Fill.BackgroundColor = cot.BatBuoc ? XLColor.LightYellow : XLColor.LightGray;

        var laSo = cot.Kieu is KieuO.SoDuong or KieuO.SoKhongAm;
        if (!laSo)
        {
            ws.Column(so).Style.NumberFormat.Format = "@";
        }

        ws.Column(so).Width = cot.Kieu is KieuO.Chu or KieuO.DanhSach or KieuO.Url ? DoRongCotChu : DoRongCotNgan;

        var danhSach = cot.Kieu == KieuO.DanhDau ? MauExcel.DanhDau : cot.LuaChon;
        if (danhSach is { Count: > 0 })
        {
            var kiemTra = ws.Range(2, so, SoDongMau, so).CreateDataValidation();
            kiemTra.List(string.Join(",", danhSach), true);
            kiemTra.IgnoreBlanks = true;
        }
    }

    private static void DienSan(XLWorkbook sach, FileMau mau)
    {
        if (ReferenceEquals(mau, MauExcel.TrungTam))
        {
            var bang = Bang(sach, mau[TenSheet.TrungTam]);
            foreach (var muc in MauExcel.MucTrungTamSheet)
            {
                bang.Them((TenCot.Muc, muc.Ten));
            }

            var gio = Bang(sach, mau[TenSheet.GioLamViec]);
            foreach (var thu in MauExcel.TenThu)
            {
                gio.Them((TenCot.Thu, thu));
            }
        }
    }

    private static void ThemHuongDan(XLWorkbook sach, FileMau mau)
    {
        var ws = sach.AddWorksheet(TenSheet.HuongDan);
        ws.Column(1).Width = 120;

        var dong = 1;
        ws.Cell(dong, 1).Value = Chuoi.Dinh(ThongBao.HuongDanTieuDe, mau.TenFile);
        ws.Cell(dong, 1).Style.Font.Bold = true;

        var noiDung = ThongBao.HuongDanChung + "\n" + (mau.TenFile switch
        {
            MauExcel.TenFileThuTuc => ThongBao.HuongDanThuTuc,
            MauExcel.TenFilePhanCong => ThongBao.HuongDanPhanCong,
            MauExcel.TenFileTrungTam => ThongBao.HuongDanTrungTam,
            _ => ThongBao.HuongDanTroLy,
        });

        foreach (var dongChu in noiDung.ReplaceLineEndings("\n").Split('\n', StringSplitOptions.RemoveEmptyEntries))
        {
            dong++;
            var o = ws.Cell(dong, 1);
            o.Value = dongChu;
            o.Style.Alignment.WrapText = true;
        }
    }
}
