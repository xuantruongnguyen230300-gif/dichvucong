using DichVuCong.Data;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using DichVuCong.Tests.Data.Mau;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Data.DuLieu;

/// <summary>Đăng ký DI của hai nguồn (plan F00 §9.3, T26) và <see cref="NguonDuLieuPostgreSql"/> không cần DB.</summary>
public class DangKyNguonDuLieuTests
{
    // Không bao giờ được kết nối tới: các test này không chạy truy vấn.
    private const string ChuoiKetNoiGia = "Host=khong-co-may-nay;Database=khong-co;Username=khong;Password=khong";

    [Fact]
    public void AddDichVuCongData_dang_ky_NguonDuLieuPostgreSql_scoped()
    {
        var dichVu = new ServiceCollection().AddDichVuCongData(ChuoiKetNoiGia);

        var moTa = Assert.Single(dichVu, d => d.ServiceType == typeof(INguonDuLieu));
        Assert.Equal(ServiceLifetime.Scoped, moTa.Lifetime);
        Assert.Equal(typeof(NguonDuLieuPostgreSql), moTa.ImplementationType);
    }

    [Fact]
    public void AddDichVuCongData_giai_quyet_duoc_trong_scope_va_moi_scope_mot_ban()
    {
        using var provider = new ServiceCollection().AddDichVuCongData(ChuoiKetNoiGia).BuildServiceProvider(validateScopes: true);

        using var scope1 = provider.CreateScope();
        using var scope2 = provider.CreateScope();
        var a = scope1.ServiceProvider.GetRequiredService<INguonDuLieu>();
        var a2 = scope1.ServiceProvider.GetRequiredService<INguonDuLieu>();
        var b = scope2.ServiceProvider.GetRequiredService<INguonDuLieu>();

        Assert.IsType<NguonDuLieuPostgreSql>(a);
        Assert.Same(a, a2);
        Assert.NotSame(a, b);
        Assert.Throws<InvalidOperationException>(() => provider.GetRequiredService<INguonDuLieu>());
    }

    [Fact]
    public void AddDichVuCongData_van_nhan_chuoi_ket_noi_nhu_cu()
    {
        Assert.Throws<ArgumentException>(() => new ServiceCollection().AddDichVuCongData(" "));
        Assert.Throws<ArgumentNullException>(() => new ServiceCollection().AddDichVuCongData(null!));
    }

    [Fact]
    public void AddDichVuCongDataMau_tep_dang_ky_NguonDuLieuMau_singleton_khong_co_AppDbContext()
    {
        var tep = MauThu.TuMa();
        var dichVu = new ServiceCollection().AddDichVuCongDataMau(tep);

        var moTa = Assert.Single(dichVu, d => d.ServiceType == typeof(INguonDuLieu));
        Assert.Equal(ServiceLifetime.Singleton, moTa.Lifetime);
        Assert.Equal(typeof(NguonDuLieuMau), moTa.ImplementationType);
        Assert.DoesNotContain(dichVu, d => d.ServiceType == typeof(AppDbContext) || d.ServiceType == typeof(DbContextOptions<AppDbContext>));

        using var provider = dichVu.BuildServiceProvider(validateScopes: true);
        var nguon = provider.GetRequiredService<INguonDuLieu>();
        Assert.IsType<NguonDuLieuMau>(nguon);
        Assert.Same(nguon, provider.GetRequiredService<INguonDuLieu>());
        Assert.Same(tep, provider.GetRequiredService<TepDuLieuMau>());
        Assert.Null(provider.GetService<AppDbContext>());
    }

    [Fact]
    public void AddDichVuCongDataMau_tep_noi_san_navigation()
    {
        var tep = MauThu.TuMa();

        _ = new ServiceCollection().AddDichVuCongDataMau(tep);

        Assert.Equal(4, tep.LanNhap.Count);
    }

    [Fact]
    public void AddDichVuCongDataMau_tep_null_bi_tu_choi()
        => Assert.Throws<ArgumentNullException>(() => new ServiceCollection().AddDichVuCongDataMau(null!));

    [Fact]
    public void NguonDuLieuPostgreSql_tra_truy_van_cua_EF_khong_theo_doi()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(ChuoiKetNoiGia)
            .UseSnakeCaseNamingConvention()
            .Options;
        using var db = new AppDbContext(options);
        var nguon = new NguonDuLieuPostgreSql(db);

        Assert.All(
            new IQueryable[]
            {
                nguon.ThuTucs, nguon.LinhVucs, nguon.PhanCongLinhVucs, nguon.NhanSus, nguon.TrungTams, nguon.GioLamViecs, nguon.LienKets,
                nguon.ODichVus, nguon.CauHoiMaus, nguon.CauHoiMauCachHois, nguon.ChuDeGoiYs, nguon.TuDongNghias, nguon.VietTats, nguon.LanNhaps,
            },
            q => Assert.IsAssignableFrom<IAsyncQueryProvider>(q.Provider));
        Assert.Contains("thu_tuc", nguon.ThuTucs.ToQueryString(), StringComparison.Ordinal);
        Assert.Contains("lan_nhap", nguon.LanNhaps.ToQueryString(), StringComparison.Ordinal);
    }

    [Fact]
    public void INguonDuLieu_co_dung_14_tap_cung_ten_voi_AppDbContext_tru_CauChuaTraLoi()
    {
        var tenNguon = typeof(INguonDuLieu).GetProperties().Select(p => p.Name).Order(StringComparer.Ordinal).ToList();
        var tenDb = typeof(AppDbContext).GetProperties()
            .Where(p => p.PropertyType.IsGenericType && p.PropertyType.GetGenericTypeDefinition() == typeof(DbSet<>))
            .Select(p => p.Name)
            .Where(n => n != nameof(AppDbContext.CauChuaTraLois))
            .Order(StringComparer.Ordinal)
            .ToList();

        Assert.Equal(14, tenNguon.Count);
        Assert.Equal(tenDb, tenNguon);
    }
}
