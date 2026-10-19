using DichVuCong.Data.Entities;
using DichVuCong.Data.Mau;

namespace DichVuCong.Data.DuLieu;

/// <summary>
/// Đọc từ <see cref="TepDuLieuMau"/> trong bộ nhớ. Vòng đời singleton: đối tượng trả ra dùng chung cho mọi yêu cầu, chỉ đọc.
/// Navigation đã nối khi nạp; EF thì không nạp navigation khi không <c>Select</c>/<c>Include</c> — truy vấn phải theo plan F00 §9.4 R2.
/// </summary>
public sealed class NguonDuLieuMau : INguonDuLieu
{
    private readonly TepDuLieuMau _tep;

    public NguonDuLieuMau(TepDuLieuMau tep)
    {
        ArgumentNullException.ThrowIfNull(tep);

        tep.KiemTraVaNoi();
        _tep = tep;
    }

    public IQueryable<ThuTuc> ThuTucs => _tep.ThuTuc.AsQueryable();

    public IQueryable<LinhVuc> LinhVucs => _tep.LinhVuc.AsQueryable();

    public IQueryable<PhanCongLinhVuc> PhanCongLinhVucs => _tep.PhanCongLinhVuc.AsQueryable();

    public IQueryable<NhanSu> NhanSus => _tep.NhanSu.AsQueryable();

    public IQueryable<TrungTam> TrungTams => _tep.TrungTams.AsQueryable();

    public IQueryable<GioLamViec> GioLamViecs => _tep.GioLamViec.AsQueryable();

    public IQueryable<LienKet> LienKets => _tep.LienKet.AsQueryable();

    public IQueryable<ODichVu> ODichVus => _tep.ODichVu.AsQueryable();

    public IQueryable<CauHoiMau> CauHoiMaus => _tep.CauHoiMau.AsQueryable();

    public IQueryable<CauHoiMauCachHoi> CauHoiMauCachHois => _tep.CauHoiMauCachHoi.AsQueryable();

    public IQueryable<ChuDeGoiY> ChuDeGoiYs => _tep.ChuDeGoiY.AsQueryable();

    public IQueryable<TuDongNghia> TuDongNghias => _tep.TuDongNghia.AsQueryable();

    public IQueryable<VietTat> VietTats => _tep.VietTat.AsQueryable();

    public IQueryable<LanNhap> LanNhaps => _tep.LanNhap.AsQueryable();
}
