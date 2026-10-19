using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DichVuCong.Data.Configurations;

internal sealed class TrungTamConfiguration : IEntityTypeConfiguration<TrungTam>
{
    public void Configure(EntityTypeBuilder<TrungTam> builder)
    {
        builder.ToTable("trung_tam", t => t.HasCheckConstraint("ck_trung_tam_mot_dong", "id = 1"));
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever();
        builder.Property(e => e.DienThoai).HasMaxLength(30);
        builder.Property(e => e.Email).HasMaxLength(254);
        builder.Property(e => e.MaDonViCongDvc).HasMaxLength(30);
    }
}
