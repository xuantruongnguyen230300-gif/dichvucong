using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace DichVuCong.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<ThuTuc> ThuTucs => Set<ThuTuc>();

    public DbSet<LinhVuc> LinhVucs => Set<LinhVuc>();

    public DbSet<PhanCongLinhVuc> PhanCongLinhVucs => Set<PhanCongLinhVuc>();

    public DbSet<NhanSu> NhanSus => Set<NhanSu>();

    public DbSet<TrungTam> TrungTams => Set<TrungTam>();

    public DbSet<GioLamViec> GioLamViecs => Set<GioLamViec>();

    public DbSet<LienKet> LienKets => Set<LienKet>();

    public DbSet<ODichVu> ODichVus => Set<ODichVu>();

    public DbSet<CauHoiMau> CauHoiMaus => Set<CauHoiMau>();

    public DbSet<CauHoiMauCachHoi> CauHoiMauCachHois => Set<CauHoiMauCachHoi>();

    public DbSet<ChuDeGoiY> ChuDeGoiYs => Set<ChuDeGoiY>();

    public DbSet<TuDongNghia> TuDongNghias => Set<TuDongNghia>();

    public DbSet<VietTat> VietTats => Set<VietTat>();

    public DbSet<CauChuaTraLoi> CauChuaTraLois => Set<CauChuaTraLoi>();

    public DbSet<LanNhap> LanNhaps => Set<LanNhap>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("unaccent");
        modelBuilder.HasPostgresExtension("pg_trgm");

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
