using DichVuCong.Api.Common.Caching;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using DichVuCong.Tests.Api.DuLieuThu;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Api;

/// <summary>
/// Test hợp đồng của phiên bản dữ liệu giữ trong bộ nhớ (<see cref="BoNhoPhienBanDuLieu"/>, <see cref="PhienBanDuLieu"/>):
/// số lần chạm nguồn dữ liệu và giá trị trả về trên mọi nguồn. Lớp con chỉ nói cách dựng <see cref="INguonDuLieu"/>.
/// </summary>
public abstract class PhienBanDuLieuContract
{
    private static readonly TimeSpan HieuLuc = TimeSpan.FromSeconds(3);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    protected abstract INguonDuLieu TaoNguon(TepDuLieuMau tep);

    private (BoNhoPhienBanDuLieu BoNho, NguonDemTruyCap Nguon, DongHoThu DongHo, ServiceProvider Goc) Dung()
    {
        var nguon = new NguonDemTruyCap(TaoNguon(DanhMucThu.Bo()));
        var goc = new ServiceCollection().AddSingleton<INguonDuLieu>(nguon).BuildServiceProvider();
        var dongHo = new DongHoThu();
        var boNho = new BoNhoPhienBanDuLieu(
            goc.GetRequiredService<IServiceScopeFactory>(), new CachingOptions { PhienBanDuLieu = HieuLuc }, dongHo);

        return (boNho, nguon, dongHo, goc);
    }

    [Fact]
    public async Task GiaTri_LaThoiDiemLanNhapGanNhat()
    {
        var (boNho, nguon, _, goc) = Dung();
        await using var _1 = goc;

        var phienBan = await boNho.LayAsync(Ct);

        var mongDoi = (await nguon.LanNhaps.LonNhatAsync(l => (DateTimeOffset?)l.ThoiDiem, Ct))!.Value.UtcTicks;
        Assert.True(phienBan > 0);
        Assert.Equal(mongDoi, phienBan);
    }

    [Fact]
    public async Task TrongThoiGianGiu_MotLanChamNguon_HetHanThiDocLai()
    {
        var (boNho, nguon, dongHo, goc) = Dung();
        await using var _1 = goc;

        var a = await boNho.LayAsync(Ct);
        var truoc = nguon.SoLanTruyCap;
        dongHo.TienToi(HieuLuc - TimeSpan.FromMilliseconds(1));
        var b = await boNho.LayAsync(Ct);

        Assert.Equal(1, truoc);
        Assert.Equal(1, nguon.SoLanTruyCap);
        Assert.Equal(a, b);

        dongHo.TienToi(TimeSpan.FromMilliseconds(1));
        var c = await boNho.LayAsync(Ct);

        Assert.Equal(2, nguon.SoLanTruyCap);
        Assert.Equal(a, c);
    }

    [Fact]
    public async Task NhieuYeuCauDongThoi_ChiMotLanChamNguon()
    {
        var (boNho, nguon, _, goc) = Dung();
        await using var _1 = goc;

        var ketQua = await Task.WhenAll(Enumerable.Range(0, 50).Select(_ => Task.Run(() => boNho.LayAsync(Ct), Ct)));

        Assert.Single(ketQua.Distinct());
        Assert.Equal(1, nguon.SoLanTruyCap);
    }

    [Fact]
    public async Task TrongMotYeuCau_GoiNhieuLan_CungMotGiaTri_VaMotLanDocBoNho()
    {
        var (boNho, nguon, dongHo, goc) = Dung();
        await using var _1 = goc;
        var phienBan = new PhienBanDuLieu(boNho);

        var a = await phienBan.LayAsync(Ct);
        // Bộ nhớ hết hạn giữa chừng nhưng yêu cầu đang chạy vẫn thấy giá trị cũ: policy cache và middleware 304 không lệch nhau.
        dongHo.TienToi(HieuLuc * 2);
        var b = await phienBan.LayAsync(Ct);

        Assert.Equal(a, b);
        Assert.Equal(1, nguon.SoLanTruyCap);
    }
}
