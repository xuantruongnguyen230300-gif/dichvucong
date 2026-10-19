using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DichVuCong.Data.Configurations;

internal sealed class ChuDeGoiYConfiguration : IEntityTypeConfiguration<ChuDeGoiY>
{
    public void Configure(EntityTypeBuilder<ChuDeGoiY> builder)
    {
        builder.ToTable("chu_de_goi_y");
        builder.HasKey(e => e.ThuTu);
        builder.Property(e => e.ThuTu).ValueGeneratedNever();
        builder.Property(e => e.TenHienThi).HasMaxLength(50);
        builder.Property(e => e.LinhVucMa).HasMaxLength(200);
    }
}
