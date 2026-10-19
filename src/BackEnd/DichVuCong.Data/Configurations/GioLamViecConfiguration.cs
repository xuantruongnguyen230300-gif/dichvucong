using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DichVuCong.Data.Configurations;

internal sealed class GioLamViecConfiguration : IEntityTypeConfiguration<GioLamViec>
{
    public void Configure(EntityTypeBuilder<GioLamViec> builder)
    {
        builder.ToTable("gio_lam_viec", t =>
        {
            t.HasCheckConstraint("ck_gio_lam_viec_thu", "thu BETWEEN 1 AND 7");
            t.HasCheckConstraint("ck_gio_lam_viec_cap_sang", "(sang_tu IS NULL) = (sang_den IS NULL)");
            t.HasCheckConstraint("ck_gio_lam_viec_cap_chieu", "(chieu_tu IS NULL) = (chieu_den IS NULL)");
            t.HasCheckConstraint("ck_gio_lam_viec_thu_tu_sang", "sang_tu IS NULL OR sang_tu < sang_den");
            t.HasCheckConstraint("ck_gio_lam_viec_thu_tu_chieu", "chieu_tu IS NULL OR chieu_tu < chieu_den");
            t.HasCheckConstraint("ck_gio_lam_viec_co_buoi", "sang_tu IS NOT NULL OR chieu_tu IS NOT NULL");
        });

        builder.HasKey(e => e.Thu);
        builder.Property(e => e.Thu).ValueGeneratedNever();
    }
}
