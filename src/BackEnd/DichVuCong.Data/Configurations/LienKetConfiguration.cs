using DichVuCong.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DichVuCong.Data.Configurations;

internal sealed class LienKetConfiguration : IEntityTypeConfiguration<LienKet>
{
    public void Configure(EntityTypeBuilder<LienKet> builder)
    {
        builder.ToTable("lien_ket");
        builder.HasKey(e => e.ThuTu);
        builder.Property(e => e.ThuTu).ValueGeneratedNever();
    }
}
