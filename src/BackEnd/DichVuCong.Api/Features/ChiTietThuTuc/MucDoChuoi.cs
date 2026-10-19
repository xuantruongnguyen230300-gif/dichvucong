using DichVuCong.Data.Entities;

namespace DichVuCong.Api.Features.ChiTietThuTuc;

/// <summary>Giá trị chuỗi của <see cref="MucDo"/> trong API (trùng tham số <c>md</c> trên địa chỉ của F04). Hàm thuần, chạy sau khi đã lấy dữ liệu (R4).</summary>
public static class MucDoChuoi
{
    public const string ToanTrinh = "toan-trinh";

    public const string MotPhan = "mot-phan";

    /// <exception cref="InvalidOperationException">Giá trị ngoài hai mức đã biết (lỗi dữ liệu).</exception>
    public static string Tu(MucDo mucDo) => mucDo switch
    {
        MucDo.ToanTrinh => ToanTrinh,
        MucDo.MotPhan => MotPhan,
        _ => throw new InvalidOperationException($"Mức độ thủ tục ngoài khoảng cho phép: {(short)mucDo}."),
    };
}
