namespace DichVuCong.Import;

/// <summary>Mã thoát của công cụ nhập (plan F01 §5.3).</summary>
public enum MaThoat
{
    /// <summary>Thành công, <c>--chi-kiem</c> hợp lệ, hoặc in hướng dẫn.</summary>
    ThanhCong = 0,

    /// <summary>File có lỗi cấu trúc hoặc lỗi dòng; không ghi gì.</summary>
    FileCoLoi = 1,

    /// <summary>Sai lệnh, sai tham số, không đọc được file, file xuất đã tồn tại.</summary>
    SaiLenh = 2,

    /// <summary>Lỗi cấu hình hoặc cơ sở dữ liệu.</summary>
    LoiHeThong = 3,
}
