using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Entities;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>Bọc một nguồn dữ liệu và trả mọi tập theo thứ tự ngược (cùng dữ liệu): kiểm kết quả không phụ thuộc thứ tự nguồn trả về.</summary>
internal sealed class NguonDaoNguoc(INguonDuLieu goc) : INguonDuLieu
{
    private static IQueryable<T> Dao<T>(IQueryable<T> tap) => tap.AsEnumerable().Reverse().AsQueryable();

    public IQueryable<ThuTuc> ThuTucs => Dao(goc.ThuTucs);

    public IQueryable<LinhVuc> LinhVucs => Dao(goc.LinhVucs);

    public IQueryable<PhanCongLinhVuc> PhanCongLinhVucs => Dao(goc.PhanCongLinhVucs);

    public IQueryable<NhanSu> NhanSus => Dao(goc.NhanSus);

    public IQueryable<TrungTam> TrungTams => Dao(goc.TrungTams);

    public IQueryable<GioLamViec> GioLamViecs => Dao(goc.GioLamViecs);

    public IQueryable<LienKet> LienKets => Dao(goc.LienKets);

    public IQueryable<ODichVu> ODichVus => Dao(goc.ODichVus);

    public IQueryable<CauHoiMau> CauHoiMaus => Dao(goc.CauHoiMaus);

    public IQueryable<CauHoiMauCachHoi> CauHoiMauCachHois => Dao(goc.CauHoiMauCachHois);

    public IQueryable<ChuDeGoiY> ChuDeGoiYs => Dao(goc.ChuDeGoiYs);

    public IQueryable<TuDongNghia> TuDongNghias => Dao(goc.TuDongNghias);

    public IQueryable<VietTat> VietTats => Dao(goc.VietTats);

    public IQueryable<LanNhap> LanNhaps => Dao(goc.LanNhaps);
}
