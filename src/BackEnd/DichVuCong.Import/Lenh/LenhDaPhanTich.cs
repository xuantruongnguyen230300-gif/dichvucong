namespace DichVuCong.Import.Lenh;

/// <summary>Loại dữ liệu của lệnh <c>nhap</c>.</summary>
public enum LoaiNhap
{
    ThuTuc,
    PhanCong,
    TrungTam,
    TroLy,
    TatCa,
}

/// <summary>Kết quả phân tích dòng lệnh.</summary>
public abstract record LenhDaPhanTich;

public sealed record LenhHuongDan : LenhDaPhanTich;

/// <param name="Loai">Loại dữ liệu cần nhập.</param>
/// <param name="DuongDan">File .xlsx, hoặc thư mục khi <paramref name="Loai"/> là <see cref="LoaiNhap.TatCa"/>.</param>
/// <param name="ChiKiem">Chỉ kiểm file, không ghi cơ sở dữ liệu.</param>
public sealed record LenhNhap(LoaiNhap Loai, string DuongDan, bool ChiKiem) : LenhDaPhanTich;

public sealed record LenhXuat(string FileRa) : LenhDaPhanTich;

public sealed record LenhTaoMau(string ThuMuc) : LenhDaPhanTich;
