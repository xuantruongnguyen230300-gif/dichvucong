using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DichVuCong.Data.Configurations;

internal sealed class VietTatConfiguration : IEntityTypeConfiguration<VietTat>
{
    public void Configure(EntityTypeBuilder<VietTat> builder)
    {
        builder.ToTable("viet_tat");
        builder.HasKey(e => e.ThuTu);
        builder.Property(e => e.ThuTu).ValueGeneratedNever();
        builder.HasIndex(e => e.ChuVietTatTimKiem).IsUnique();
    }
}
