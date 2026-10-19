namespace DichVuCong.Api.Common.Errors;

/// <summary>
/// Danh mục mã lỗi trả trong ProblemDetails (trường mở rộng <c>code</c>). FE dịch theo mã, BE không trả câu chữ.
/// Chức năng sau cần mã riêng thì thêm vào đây và vào common.json của FE.
/// </summary>
public static class MaLoi
{
    public const string TruongCode = "code";

    public const string DuLieuKhongHopLe = "du-lieu-khong-hop-le";
    public const string KhongTimThay = "khong-tim-thay";
    public const string PhuongThucKhongHopLe = "phuong-thuc-khong-hop-le";
    public const string YeuCauQuaLon = "yeu-cau-qua-lon";
    public const string QuaNhieuYeuCau = "qua-nhieu-yeu-cau";
    public const string LoiHeThong = "loi-he-thong";

    /// <summary>Mã lỗi theo mã HTTP. Mã 4xx ngoài bảng → du-lieu-khong-hop-le; 5xx → loi-he-thong.</summary>
    public static string TuMaHttp(int status) => status switch
    {
        StatusCodes.Status404NotFound => KhongTimThay,
        StatusCodes.Status405MethodNotAllowed => PhuongThucKhongHopLe,
        StatusCodes.Status413PayloadTooLarge => YeuCauQuaLon,
        StatusCodes.Status429TooManyRequests => QuaNhieuYeuCau,
        >= 500 => LoiHeThong,
        _ => DuLieuKhongHopLe,
    };
}
