using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace DichVuCong.Data.DuLieu;

/// <summary>Đọc từ PostgreSQL qua EF Core, không theo dõi thay đổi. Vòng đời scoped, theo <see cref="AppDbContext"/>.</summary>
public sealed class NguonDuLieuPostgreSql(AppDbContext db) : INguonDuLieu
{
    public IQueryable<ThuTuc> ThuTucs => db.ThuTucs.AsNoTracking();

    public IQueryable<LinhVuc> LinhVucs => db.LinhVucs.AsNoTracking();

    public IQueryable<PhanCongLinhVuc> PhanCongLinhVucs => db.PhanCongLinhVucs.AsNoTracking();

    public IQueryable<NhanSu> NhanSus => db.NhanSus.AsNoTracking();

    public IQueryable<TrungTam> TrungTams => db.TrungTams.AsNoTracking();

    public IQueryable<GioLamViec> GioLamViecs => db.GioLamViecs.AsNoTracking();

    public IQueryable<LienKet> LienKets => db.LienKets.AsNoTracking();

    public IQueryable<ODichVu> ODichVus => db.ODichVus.AsNoTracking();

    public IQueryable<CauHoiMau> CauHoiMaus => db.CauHoiMaus.AsNoTracking();

    public IQueryable<CauHoiMauCachHoi> CauHoiMauCachHois => db.CauHoiMauCachHois.AsNoTracking();

    public IQueryable<ChuDeGoiY> ChuDeGoiYs => db.ChuDeGoiYs.AsNoTracking();

    public IQueryable<TuDongNghia> TuDongNghias => db.TuDongNghias.AsNoTracking();

    public IQueryable<VietTat> VietTats => db.VietTats.AsNoTracking();

    public IQueryable<LanNhap> LanNhaps => db.LanNhaps.AsNoTracking();
}
