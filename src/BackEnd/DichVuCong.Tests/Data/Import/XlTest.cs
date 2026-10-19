using ClosedXML.Excel;
using DichVuCong.Import.Excel;

namespace DichVuCong.Tests.Data.Import;

/// <summary>Dựng workbook trong bộ nhớ từ file mẫu thật, để test không cần DB hay file trên đĩa.</summary>
internal static class XlTest
{
    public const char U200E = (char)0x200E;

    public static XLWorkbook Mau(FileMau mau) => GhiExcel.TaoMau(mau, dienSan: false);

    public static BangGhi Bang(XLWorkbook sach, FileMau mau, string tenSheet) => GhiExcel.Bang(sach, mau[tenSheet]);

    public static FileDoc Doc(XLWorkbook sach, FileMau mau) => DocExcel.Doc(sach, mau, "test.xlsx");

    /// <summary>Số cột (từ 1) của <paramref name="tenCot"/> trong sheet.</summary>
    public static int SoCot(FileMau mau, string tenSheet, string tenCot)
        => mau[tenSheet].Cot.ToList().FindIndex(c => c.Ten == tenCot) + 1;

    /// <summary>Ghi ô kiểu số (không phải chữ) vào dòng Excel <paramref name="dong"/>.</summary>
    public static void DatSo(XLWorkbook sach, FileMau mau, string tenSheet, int dong, string tenCot, double so)
        => sach.Worksheet(tenSheet).Cell(dong, SoCot(mau, tenSheet, tenCot)).Value = so;

    public static void DatChu(XLWorkbook sach, FileMau mau, string tenSheet, int dong, string tenCot, string chu)
        => sach.Worksheet(tenSheet).Cell(dong, SoCot(mau, tenSheet, tenCot)).Value = chu;

    /// <summary>Lưu rồi đọc lại, để ô công thức có giá trị đã lưu như file thật.</summary>
    public static XLWorkbook LuuRoiDoc(XLWorkbook sach)
    {
        var luong = new MemoryStream();
        sach.SaveAs(luong, validate: false, evaluateFormulae: true);
        luong.Position = 0;
        return new XLWorkbook(luong);
    }
}
