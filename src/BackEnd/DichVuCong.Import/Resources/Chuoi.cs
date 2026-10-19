using System.Globalization;

namespace DichVuCong.Import.Resources;

/// <summary>Định dạng câu có tham số lấy từ <see cref="ThongBao"/>.</summary>
internal static class Chuoi
{
    public static string Dinh(string mau, params object?[] thamSo)
        => string.Format(CultureInfo.CurrentCulture, mau, thamSo);
}
