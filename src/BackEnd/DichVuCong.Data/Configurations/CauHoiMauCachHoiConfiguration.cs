using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DichVuCong.Data.Configurations;

internal sealed class CauHoiMauCachHoiConfiguration : IEntityTypeConfiguration<CauHoiMauCachHoi>
{
    public void Configure(EntityTypeBuilder<CauHoiMauCachHoi> builder)
    {
        builder.ToTable("cau_hoi_mau_cach_hoi");
        builder.HasKey(e => new { e.CauHoiMauThuTu, e.ThuTu });
        builder.Property(e => e.CauHoiMauThuTu).ValueGeneratedNever();
        builder.Property(e => e.ThuTu).ValueGeneratedNever();

        // Khoá chính bắt đầu bằng cột khoá ngoại nên đã đóng vai trò index của khoá ngoại.
        builder.HasOne(e => e.CauHoiMau)
            .WithMany(c => c.CachHoi)
            .HasForeignKey(e => e.CauHoiMauThuTu)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.NoiDungTimKiem).HasMethod("gin").HasOperators("gin_trgm_ops");
    }
}
