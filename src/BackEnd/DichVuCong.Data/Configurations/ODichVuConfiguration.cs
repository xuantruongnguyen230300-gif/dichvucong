using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DichVuCong.Data.Configurations;

internal sealed class ODichVuConfiguration : IEntityTypeConfiguration<ODichVu>
{
    public void Configure(EntityTypeBuilder<ODichVu> builder)
    {
        builder.ToTable("o_dich_vu");
        builder.HasKey(e => e.ThuTu);
        builder.Property(e => e.ThuTu).ValueGeneratedNever();
        builder.Property(e => e.BieuTuong).HasMaxLength(30);
    }
}
