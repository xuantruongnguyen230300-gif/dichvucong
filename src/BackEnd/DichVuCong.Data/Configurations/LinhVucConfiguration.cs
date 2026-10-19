using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DichVuCong.Data.Configurations;

internal sealed class LinhVucConfiguration : IEntityTypeConfiguration<LinhVuc>
{
    public void Configure(EntityTypeBuilder<LinhVuc> builder)
    {
        builder.ToTable("linh_vuc");
        builder.HasKey(e => e.Ma);
        builder.Property(e => e.Ma).HasMaxLength(200).ValueGeneratedNever();
        builder.HasIndex(e => e.TenTimKiem).HasMethod("gin").HasOperators("gin_trgm_ops");
    }
}
