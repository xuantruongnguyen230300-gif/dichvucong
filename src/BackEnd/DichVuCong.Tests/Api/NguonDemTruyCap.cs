using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Entities;

namespace DichVuCong.Tests.Api;

/// <summary>Bọc một <see cref="INguonDuLieu"/> và đếm số lần dịch vụ lấy bất kỳ tập dữ liệu nào (kiểm "không chạm nguồn dữ liệu").</summary>
public sealed class NguonDemTruyCap(INguonDuLieu goc) : INguonDuLieu
{
    private int _dem;
    private int _demLanNhap;

    public int SoLanTruyCap => Volatile.Read(ref _dem);

    /// <summary>Số lần lấy tập <c>lan_nhap</c> (nguồn của phiên bản dữ liệu).</summary>
    public int SoLanTruyCapLanNhap => Volatile.Read(ref _demLanNhap);

    private IQueryable<T> Dem<T>(IQueryable<T> tap)
    {
        Interlocked.Increment(ref _dem);
        return tap;
    }

    public IQueryable<ThuTuc> ThuTucs => Dem(goc.ThuTucs);

    public IQueryable<LinhVuc> LinhVucs => Dem(goc.LinhVucs);

    public IQueryable<PhanCongLinhVuc> PhanCongLinhVucs => Dem(goc.PhanCongLinhVucs);

    public IQueryable<NhanSu> NhanSus => Dem(goc.NhanSus);

    public IQueryable<TrungTam> TrungTams => Dem(goc.TrungTams);

    public IQueryable<GioLamViec> GioLamViecs => Dem(goc.GioLamViecs);

    public IQueryable<LienKet> LienKets => Dem(goc.LienKets);

    public IQueryable<ODichVu> ODichVus => Dem(goc.ODichVus);

    public IQueryable<CauHoiMau> CauHoiMaus => Dem(goc.CauHoiMaus);

    public IQueryable<CauHoiMauCachHoi> CauHoiMauCachHois => Dem(goc.CauHoiMauCachHois);

    public IQueryable<ChuDeGoiY> ChuDeGoiYs => Dem(goc.ChuDeGoiYs);

    public IQueryable<TuDongNghia> TuDongNghias => Dem(goc.TuDongNghias);

    public IQueryable<VietTat> VietTats => Dem(goc.VietTats);

    public IQueryable<LanNhap> LanNhaps
    {
        get
        {
            Interlocked.Increment(ref _demLanNhap);
            return Dem(goc.LanNhaps);
        }
    }
}
