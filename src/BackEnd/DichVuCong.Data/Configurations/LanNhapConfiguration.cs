using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DichVuCong.Data.Configurations;

internal sealed class LanNhapConfiguration : IEntityTypeConfiguration<LanNhap>
{
    public void Configure(EntityTypeBuilder<LanNhap> builder)
    {
        builder.ToTable("lan_nhap", t => t.HasCheckConstraint(
            "ck_lan_nhap_loai",
            $"loai IN ('{LanNhap.ThuTuc}', '{LanNhap.PhanCong}', '{LanNhap.TrungTam}', '{LanNhap.TroLy}')"));

        builder.HasKey(e => e.Loai);
        builder.Property(e => e.Loai).HasMaxLength(20).ValueGeneratedNever();
    }
}
