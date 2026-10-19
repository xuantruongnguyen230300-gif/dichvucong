using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DichVuCong.Data.Configurations;

internal sealed class NhanSuConfiguration : IEntityTypeConfiguration<NhanSu>
{
    public void Configure(EntityTypeBuilder<NhanSu> builder)
    {
        builder.ToTable("nhan_su", t => t.HasCheckConstraint("ck_nhan_su_quay", "quay > 0"));
        builder.HasKey(e => e.ThuTu);
        builder.Property(e => e.ThuTu).ValueGeneratedNever();
        builder.Property(e => e.XungHo).HasMaxLength(20);
    }
}
