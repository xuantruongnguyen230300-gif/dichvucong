using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DichVuCong.Data.Configurations;

internal sealed class ThuTucConfiguration : IEntityTypeConfiguration<ThuTuc>
{
    public void Configure(EntityTypeBuilder<ThuTuc> builder)
    {
        builder.ToTable("thu_tuc", t =>
        {
            t.HasCheckConstraint("ck_thu_tuc_danh_muc", "thuoc_danh_muc_xa OR thuoc_danh_muc_tinh");
            t.HasCheckConstraint("ck_thu_tuc_muc_do", "muc_do IN (1, 2)");
            t.HasCheckConstraint("ck_thu_tuc_thu_tu_thuong_gap", "thu_tu_thuong_gap > 0");
        });

        builder.HasKey(e => e.Ma);
        builder.Property(e => e.Ma).HasMaxLength(20).ValueGeneratedNever();
        builder.Property(e => e.LinhVucMa).HasMaxLength(200);
        builder.Property(e => e.MaDvc).HasMaxLength(30);
        builder.Property(e => e.DonViMa).HasMaxLength(30);

        builder.HasOne(e => e.LinhVuc)
            .WithMany(l => l.ThuTucs)
            .HasForeignKey(e => e.LinhVucMa)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.LinhVucMa);
        builder.HasIndex(e => e.ThuTuThuongGap).IsUnique();
        builder.HasIndex(e => e.TenTimKiem).HasMethod("gin").HasOperators("gin_trgm_ops");

        builder.ComplexCollection(e => e.TrinhTu, c => c.ToJson("trinh_tu"));
        builder.ComplexCollection(e => e.CachThuc, c => c.ToJson("cach_thuc"));
        builder.ComplexCollection(e => e.ThanhPhanHoSo, c => c.ToJson("thanh_phan_ho_so"));
        builder.ComplexCollection(e => e.CanCu, c => c.ToJson("can_cu"));
    }
}
