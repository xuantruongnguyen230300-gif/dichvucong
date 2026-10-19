using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Data.Entities;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>Kho câu chưa trả lời trong bộ nhớ (F00 T28, plan §9.6; gộp và che dữ liệu theo F06 BR-7, BR-8). Đồng hồ giả.</summary>
public sealed class KhoCauChuaTraLoiMauTests
{
    private static readonly DateTimeOffset BayGio = new(2026, 10, 12, 8, 0, 0, TimeSpan.Zero);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Cau_moi_la_mot_dong_mot_lan_gap_lan_gap_cuoi_la_bay_gio()
    {
        var kho = new KhoCauChuaTraLoiMau(new DongHoGia(BayGio));

        await kho.GhiAsync("Đăng ký khai sinh?", Ct);

        var dong = Assert.Single(kho.ChupCacDong());
        Assert.Equal("Đăng ký khai sinh?", dong.NoiDung);
        Assert.Equal("dang ky khai sinh?", dong.KhoaGop);
        Assert.Equal(1, dong.SoLanGap);
        Assert.Equal(BayGio, dong.LanGapCuoi);
    }

    [Fact]
    public async Task Cau_giong_nhau_sau_khi_chuan_hoa_gop_thanh_mot_dong_giu_noi_dung_dau()
    {
        var dongHo = new DongHoGia(BayGio);
        var kho = new KhoCauChuaTraLoiMau(dongHo);

        await kho.GhiAsync("Đăng ký khai sinh?", Ct);
        dongHo.TienToi(TimeSpan.FromMinutes(5));
        await kho.GhiAsync("dang ky   KHAI SINH?", Ct);

        var dong = Assert.Single(kho.ChupCacDong());
        Assert.Equal("Đăng ký khai sinh?", dong.NoiDung);
        Assert.Equal(2, dong.SoLanGap);
        Assert.Equal(BayGio.AddMinutes(5), dong.LanGapCuoi);
    }

    [Fact]
    public async Task Cau_khac_nhau_la_hai_dong()
    {
        var kho = new KhoCauChuaTraLoiMau(new DongHoGia(BayGio));

        await kho.GhiAsync("đăng ký khai sinh?", Ct);
        await kho.GhiAsync("đăng ký kết hôn?", Ct);

        Assert.Equal(2, kho.ChupCacDong().Count);
    }

    [Fact]
    public async Task Dong_thu_1001_bo_dong_cu_nhat_con_1000()
    {
        var dongHo = new DongHoGia(BayGio);
        var kho = new KhoCauChuaTraLoiMau(dongHo);
        for (var i = 0; i < KhoCauChuaTraLoiMau.SoDongToiDa; i++)
        {
            await kho.GhiAsync($"cau {i}", Ct);
            dongHo.TienToi(TimeSpan.FromSeconds(1));
        }

        await kho.GhiAsync("cau moi", Ct);

        var cacDong = kho.ChupCacDong();
        Assert.Equal(KhoCauChuaTraLoiMau.SoDongToiDa, cacDong.Count);
        Assert.DoesNotContain(cacDong, d => d.NoiDung == "cau 0");
        Assert.Contains(cacDong, d => d.NoiDung == "cau 1");
        Assert.Equal("cau moi", cacDong[^1].NoiDung);
    }

    [Fact]
    public async Task Day_ma_cung_gio_thi_bo_dong_ghi_som_nhat()
    {
        var kho = new KhoCauChuaTraLoiMau(new DongHoGia(BayGio));
        for (var i = 0; i < KhoCauChuaTraLoiMau.SoDongToiDa; i++)
        {
            await kho.GhiAsync($"cau {i}", Ct);
        }

        await kho.GhiAsync("cau moi", Ct);

        var cacDong = kho.ChupCacDong();
        Assert.Equal(KhoCauChuaTraLoiMau.SoDongToiDa, cacDong.Count);
        Assert.DoesNotContain(cacDong, d => d.NoiDung == "cau 0");
        Assert.Contains(cacDong, d => d.NoiDung == "cau 1");
    }

    [Fact]
    public async Task Dong_vua_gap_lai_khong_con_la_cu_nhat()
    {
        var dongHo = new DongHoGia(BayGio);
        var kho = new KhoCauChuaTraLoiMau(dongHo);
        for (var i = 0; i < KhoCauChuaTraLoiMau.SoDongToiDa; i++)
        {
            await kho.GhiAsync($"cau {i}", Ct);
            dongHo.TienToi(TimeSpan.FromSeconds(1));
        }

        await kho.GhiAsync("cau 0", Ct);
        await kho.GhiAsync("cau moi", Ct);

        var cacDong = kho.ChupCacDong();
        Assert.Equal(KhoCauChuaTraLoiMau.SoDongToiDa, cacDong.Count);
        Assert.Contains(cacDong, d => d.NoiDung == "cau 0" && d.SoLanGap == 2);
        Assert.DoesNotContain(cacDong, d => d.NoiDung == "cau 1");
    }

    [Fact]
    public async Task Kho_day_ma_gap_lai_cau_da_co_thi_khong_bo_dong_nao()
    {
        var dongHo = new DongHoGia(BayGio);
        var kho = new KhoCauChuaTraLoiMau(dongHo);
        for (var i = 0; i < KhoCauChuaTraLoiMau.SoDongToiDa; i++)
        {
            await kho.GhiAsync($"cau {i}", Ct);
            dongHo.TienToi(TimeSpan.FromSeconds(1));
        }

        await kho.GhiAsync("cau 500", Ct);

        var cacDong = kho.ChupCacDong();
        Assert.Equal(KhoCauChuaTraLoiMau.SoDongToiDa, cacDong.Count);
        Assert.Contains(cacDong, d => d.NoiDung == "cau 0");
    }

    /// <summary>Dòng có lần gặp cuối trước mốc bị xoá; đúng mốc thì giữ (F06 BR-12).</summary>
    [Fact]
    public async Task XoaQuaHan_bo_dong_truoc_moc_giu_dong_dung_moc()
    {
        var dongHo = new DongHoGia(BayGio);
        var kho = new KhoCauChuaTraLoiMau(dongHo);
        await kho.GhiAsync("truoc moc", Ct);
        dongHo.TienToi(TimeSpan.FromSeconds(1));
        await kho.GhiAsync("dung moc", Ct);
        dongHo.TienToi(TimeSpan.FromSeconds(1));
        await kho.GhiAsync("sau moc", Ct);

        var soDong = await kho.XoaQuaHanAsync(BayGio.AddSeconds(1), Ct);

        Assert.Equal(1, soDong);
        Assert.Equal(["dung moc", "sau moc"], kho.ChupCacDong().Select(d => d.NoiDung));
    }

    [Fact]
    public async Task XoaQuaHan_khong_co_dong_nao_qua_han_tra_0()
    {
        var kho = new KhoCauChuaTraLoiMau(new DongHoGia(BayGio));
        await kho.GhiAsync("cau", Ct);

        Assert.Equal(0, await kho.XoaQuaHanAsync(BayGio, Ct));
        Assert.Single(kho.ChupCacDong());
    }

    [Fact]
    public async Task Cau_da_bi_xoa_gap_lai_thi_la_dong_moi_mot_lan_gap()
    {
        var dongHo = new DongHoGia(BayGio);
        var kho = new KhoCauChuaTraLoiMau(dongHo);
        await kho.GhiAsync("cau", Ct);
        await kho.GhiAsync("cau", Ct);
        dongHo.TienToi(TimeSpan.FromDays(91));
        await kho.XoaQuaHanAsync(dongHo.GetUtcNow() - CauChuaTraLoi.ThoiGianGiu, Ct);

        await kho.GhiAsync("cau", Ct);

        Assert.Equal(1, Assert.Single(kho.ChupCacDong()).SoLanGap);
    }

    [Fact]
    public async Task Ghi_song_song_1000_lan_tong_so_lan_gap_dung()
    {
        var kho = new KhoCauChuaTraLoiMau(new DongHoGia(BayGio));

        await Task.WhenAll(Enumerable.Range(0, 1_000).Select(_ => Task.Run(() => kho.GhiAsync("Đăng ký khai sinh?", Ct), Ct)));

        Assert.Equal(1_000, Assert.Single(kho.ChupCacDong()).SoLanGap);
    }

    [Fact]
    public async Task Ghi_song_song_nhieu_cau_moi_cau_dem_dung()
    {
        var kho = new KhoCauChuaTraLoiMau(new DongHoGia(BayGio));

        await Task.WhenAll(Enumerable.Range(0, 1_000).Select(i => Task.Run(() => kho.GhiAsync($"cau {i % 10}", Ct), Ct)));

        var cacDong = kho.ChupCacDong();
        Assert.Equal(10, cacDong.Count);
        Assert.All(cacDong, d => Assert.Equal(100, d.SoLanGap));
    }

    [Fact]
    public async Task Cau_dai_dung_500_ky_tu_duoc_ghi()
    {
        var kho = new KhoCauChuaTraLoiMau(new DongHoGia(BayGio));

        await kho.GhiAsync(new string('a', CauChuaTraLoi.DoDaiToiDa), Ct);

        Assert.Single(kho.ChupCacDong());
    }

    [Fact]
    public async Task Cau_dai_hon_500_ky_tu_nem_ArgumentOutOfRangeException_va_khong_ghi()
    {
        var kho = new KhoCauChuaTraLoiMau(new DongHoGia(BayGio));

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(
            () => kho.GhiAsync(new string('a', CauChuaTraLoi.DoDaiToiDa + 1), Ct));

        Assert.Empty(kho.ChupCacDong());
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Cau_rong_nem_ArgumentException(string cau)
    {
        var kho = new KhoCauChuaTraLoiMau(new DongHoGia(BayGio));

        await Assert.ThrowsAsync<ArgumentException>(() => kho.GhiAsync(cau, Ct));
    }
}
