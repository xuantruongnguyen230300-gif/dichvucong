using DichVuCong.Data.Entities;

namespace DichVuCong.Data.DuLieu;

/// <summary>
/// Dữ liệu nhập (F01), chỉ đọc. Không có <c>cau_chua_tra_loi</c>: phần ghi nằm sau interface riêng của trợ lý (plan F00 §9.6).
/// Tên thuộc tính như <see cref="AppDbContext"/>.
/// </summary>
/// <remarks>
/// Viết truy vấn theo plan F00 §9.4: <c>Select</c> thẳng ra DTO, không sắp theo chuỗi, không gọi hàm tự viết hay <c>EF.Functions</c>
/// trong biểu thức, lấy kết quả bằng <see cref="TruyVan"/>. Entity lấy từ nguồn Mẫu là đối tượng dùng chung, không được sửa.
/// </remarks>
public interface INguonDuLieu
{
    IQueryable<ThuTuc> ThuTucs { get; }

    IQueryable<LinhVuc> LinhVucs { get; }

    IQueryable<PhanCongLinhVuc> PhanCongLinhVucs { get; }

    IQueryable<NhanSu> NhanSus { get; }

    IQueryable<TrungTam> TrungTams { get; }

    IQueryable<GioLamViec> GioLamViecs { get; }

    IQueryable<LienKet> LienKets { get; }

    IQueryable<ODichVu> ODichVus { get; }

    IQueryable<CauHoiMau> CauHoiMaus { get; }

    IQueryable<CauHoiMauCachHoi> CauHoiMauCachHois { get; }

    IQueryable<ChuDeGoiY> ChuDeGoiYs { get; }

    IQueryable<TuDongNghia> TuDongNghias { get; }

    IQueryable<VietTat> VietTats { get; }

    IQueryable<LanNhap> LanNhaps { get; }
}
