using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DichVuCong.Data.Configurations;

internal sealed class CauChuaTraLoiConfiguration : IEntityTypeConfiguration<CauChuaTraLoi>
{
    public void Configure(EntityTypeBuilder<CauChuaTraLoi> builder)
    {
        builder.ToTable("cau_chua_tra_loi", t =>
        {
            t.HasCheckConstraint("ck_cau_chua_tra_loi_so_lan_gap", "so_lan_gap >= 1");
            t.HasCheckConstraint("ck_cau_chua_tra_loi_noi_dung", $"char_length(noi_dung) <= {CauChuaTraLoi.DoDaiToiDa}");
        });

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedOnAdd();
        builder.HasIndex(e => e.KhoaGop).IsUnique();
        builder.HasIndex(e => e.LanGapCuoi);
    }
}
