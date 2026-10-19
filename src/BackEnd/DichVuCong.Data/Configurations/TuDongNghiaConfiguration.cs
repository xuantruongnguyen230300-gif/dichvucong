using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DichVuCong.Data.Configurations;

internal sealed class TuDongNghiaConfiguration : IEntityTypeConfiguration<TuDongNghia>
{
    public void Configure(EntityTypeBuilder<TuDongNghia> builder)
    {
        builder.ToTable("tu_dong_nghia");
        builder.HasKey(e => e.ThuTu);
        builder.Property(e => e.ThuTu).ValueGeneratedNever();
        builder.HasIndex(e => e.TuTimKiem).IsUnique();
    }
}
