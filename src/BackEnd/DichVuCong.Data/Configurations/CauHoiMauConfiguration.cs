using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DichVuCong.Data.Configurations;

internal sealed class CauHoiMauConfiguration : IEntityTypeConfiguration<CauHoiMau>
{
    public void Configure(EntityTypeBuilder<CauHoiMau> builder)
    {
        builder.ToTable("cau_hoi_mau", t =>
        {
            t.HasCheckConstraint("ck_cau_hoi_mau_tra_loi_hoac_muc", "(tra_loi IS NULL) <> (muc_trung_tam IS NULL)");
            t.HasCheckConstraint("ck_cau_hoi_mau_muc_trung_tam", "muc_trung_tam BETWEEN 1 AND 5");
        });

        builder.HasKey(e => e.ThuTu);
        builder.Property(e => e.ThuTu).ValueGeneratedNever();
    }
}
