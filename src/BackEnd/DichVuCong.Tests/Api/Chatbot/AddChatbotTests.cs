using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Data.DuLieu;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary><c>AddChatbot(LoaiNguonDuLieu)</c> chọn kho theo nguồn (F00 T28, plan §9.6).</summary>
public sealed class AddChatbotTests
{
    private static readonly DateTimeOffset BayGio = new(2026, 10, 12, 8, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Nguon_Mau_dang_ky_kho_Mau_singleton_va_viec_dinh_ky()
    {
        var services = new ServiceCollection();

        services.AddChatbot(LoaiNguonDuLieu.Mau);

        var kho = Assert.Single(services, d => d.ServiceType == typeof(IKhoCauChuaTraLoi));
        Assert.Equal(typeof(KhoCauChuaTraLoiMau), kho.ImplementationType);
        Assert.Equal(ServiceLifetime.Singleton, kho.Lifetime);
        Assert.Single(services, d => d.ServiceType == typeof(IHostedService) && d.ImplementationType == typeof(XoaCauChuaTraLoiHetHan));
    }

    [Fact]
    public void Nguon_PostgreSql_dang_ky_kho_PostgreSql_scoped_va_viec_dinh_ky()
    {
        var services = new ServiceCollection();

        services.AddChatbot(LoaiNguonDuLieu.PostgreSql);

        var kho = Assert.Single(services, d => d.ServiceType == typeof(IKhoCauChuaTraLoi));
        Assert.Equal(typeof(KhoCauChuaTraLoiPostgreSql), kho.ImplementationType);
        Assert.Equal(ServiceLifetime.Scoped, kho.Lifetime);
        Assert.Single(services, d => d.ServiceType == typeof(IHostedService) && d.ImplementationType == typeof(XoaCauChuaTraLoiHetHan));
    }

    [Fact]
    public void Nguon_Mau_cung_mot_kho_o_moi_scope()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddChatbot(LoaiNguonDuLieu.Mau);
        services.ThemPhuThuocTroLy();
        using var dichVu = services.BuildServiceProvider(new ServiceProviderOptions { ValidateOnBuild = true, ValidateScopes = true });

        using var scope1 = dichVu.CreateScope();
        using var scope2 = dichVu.CreateScope();

        Assert.Same(
            scope1.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>(),
            scope2.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>());
    }

    [Theory]
    [InlineData(LoaiNguonDuLieu.Mau)]
    [InlineData(LoaiNguonDuLieu.PostgreSql)]
    public void Giu_TimeProvider_da_co(LoaiNguonDuLieu nguon)
    {
        var dongHo = new DongHoGia(BayGio);
        var services = new ServiceCollection().AddSingleton<TimeProvider>(dongHo);

        services.AddChatbot(nguon);

        Assert.Same(dongHo, Assert.Single(services, d => d.ServiceType == typeof(TimeProvider)).ImplementationInstance);
    }

    [Theory]
    [InlineData(LoaiNguonDuLieu.Mau)]
    [InlineData(LoaiNguonDuLieu.PostgreSql)]
    public void Khong_co_TimeProvider_thi_dung_gio_he_thong(LoaiNguonDuLieu nguon)
    {
        var services = new ServiceCollection();

        services.AddChatbot(nguon);

        Assert.Same(TimeProvider.System, Assert.Single(services, d => d.ServiceType == typeof(TimeProvider)).ImplementationInstance);
    }

    [Fact]
    public void Nguon_la_khong_hop_le_thi_nem_loi()
    {
        var services = new ServiceCollection();

        Assert.Throws<ArgumentOutOfRangeException>(() => services.AddChatbot((LoaiNguonDuLieu)99));
    }
}
