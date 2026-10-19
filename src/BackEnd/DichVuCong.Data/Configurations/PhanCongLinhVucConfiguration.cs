using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DichVuCong.Data.Configurations;

internal sealed class PhanCongLinhVucConfiguration : IEntityTypeConfiguration<PhanCongLinhVuc>
{
    public void Configure(EntityTypeBuilder<PhanCongLinhVuc> builder)
    {
        builder.ToTable("phan_cong_linh_vuc", t => t.HasCheckConstraint("ck_phan_cong_linh_vuc_quay", "quay > 0"));
        builder.HasKey(e => e.LinhVucMa);
        builder.Property(e => e.LinhVucMa).HasMaxLength(200).ValueGeneratedNever();
    }
}
