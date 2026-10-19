using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Data;
using DichVuCong.Data.Entities;
using DichVuCong.Tests.Api.Chatbot;
using Microsoft.EntityFrameworkCore;

namespace DichVuCong.Tests.Integration.Chatbot;

/// <summary>
/// <c>KhoCauChuaTraLoiPostgreSql</c> với DB thật (plan F00 §9.6, T31): <c>INSERT … ON CONFLICT</c> gộp đúng, cộng đồng thời đúng,
/// xoá quá hạn đúng mốc. Test với <c>DbGiaLap</c> chỉ kiểm câu lệnh, không kiểm kết quả thật trong DB.
/// </summary>
public sealed class KhoCauChuaTraLoiPostgreSqlTrenDbThatTests(DbThuNghiem db) : IClassFixture<DbThuNghiem>
{
    private static readonly DateTimeOffset BatDau = new(2026, 10, 12, 8, 0, 0, TimeSpan.Zero);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private (KhoCauChuaTraLoiPostgreSql Kho, AppDbContext Db) TaoKho(DongHoGia dongHo)
    {
        var ngu = db.TaoDbContext();
        return (new KhoCauChuaTraLoiPostgreSql(ngu, dongHo), ngu);
    }

    private async Task<List<CauChuaTraLoi>> DocTatCaAsync()
    {
        await using var doc = db.TaoDbContext();
        return await doc.CauChuaTraLois.AsNoTracking().OrderBy(c => c.KhoaGop).ToListAsync(Ct);
    }

    [Fact]
    public async Task HaiCauCungKhoaGop_MotDong_HaiLanGap_LanCuoiTheoDongHo()
    {
        db.CanCoDb();
        db.XoaHet();
        var dongHo = new DongHoGia(BatDau);
        var (kho, ctx) = TaoKho(dongHo);
        await using var _ = ctx;

        await kho.GhiAsync("Đăng ký khai sinh?", Ct);
        dongHo.TienToi(TimeSpan.FromMinutes(5));
        await kho.GhiAsync("dang ky khai sinh?", Ct);

        var dong = Assert.Single(await DocTatCaAsync());
        Assert.Equal(2, dong.SoLanGap);
        Assert.Equal("dang ky khai sinh?", dong.KhoaGop);
        // ON CONFLICT chỉ cộng lần gặp và cập nhật lần cuối; nội dung giữ bản đầu.
        Assert.Equal("Đăng ký khai sinh?", dong.NoiDung);
        Assert.Equal(BatDau.AddMinutes(5), dong.LanGapCuoi);
    }

    [Fact]
    public async Task HaiCauKhacKhoa_HaiDong_MoiDongMotLan()
    {
        db.CanCoDb();
        db.XoaHet();
        var (kho, ctx) = TaoKho(new DongHoGia(BatDau));
        await using var _ = ctx;

        await kho.GhiAsync("Làm căn cước ở đâu?", Ct);
        await kho.GhiAsync("Xin giấy phép xây dựng?", Ct);

        var tatCa = await DocTatCaAsync();
        Assert.Equal(2, tatCa.Count);
        Assert.All(tatCa, d => Assert.Equal(1, d.SoLanGap));
    }

    [Fact]
    public async Task GhiDongThoi_ManhDongNguonKhacNhau_CongDungTongSoLanGap()
    {
        db.CanCoDb();
        db.XoaHet();
        var dongHo = new DongHoGia(BatDau);
        const int SoLan = 40;

        // Mỗi lượt ghi dùng một DbContext riêng như mỗi yêu cầu HTTP (scoped), mô phỏng nhiều yêu cầu và nhiều bản API cùng ghi.
        var viec = Enumerable.Range(0, SoLan).Select(async i =>
        {
            var (kho, ctx) = TaoKho(dongHo);
            await using var _ = ctx;
            await kho.GhiAsync(i % 2 == 0 ? "Đăng ký tạm trú?" : "dang ky tam tru?", Ct);
        });
        await Task.WhenAll(viec);

        var dong = Assert.Single(await DocTatCaAsync());
        Assert.Equal(SoLan, dong.SoLanGap);
    }

    [Fact]
    public async Task XoaQuaHan_BoDongTruocMoc_GiuDongDungMocVaSau_TraSoDongDaXoa()
    {
        db.CanCoDb();
        db.XoaHet();
        var dongHo = new DongHoGia(BatDau);
        var (kho, ctx) = TaoKho(dongHo);
        await using var _ = ctx;

        await kho.GhiAsync("câu cũ", Ct);
        dongHo.TienToi(TimeSpan.FromDays(1));
        await kho.GhiAsync("câu đúng mốc", Ct);
        dongHo.TienToi(TimeSpan.FromDays(1));
        await kho.GhiAsync("câu mới", Ct);
        var moc = BatDau.AddDays(1);

        var daXoa = await kho.XoaQuaHanAsync(moc, Ct);

        Assert.Equal(1, daXoa);
        Assert.Equal(["câu mới", "câu đúng mốc"], (await DocTatCaAsync()).Select(d => d.NoiDung).Order(StringComparer.Ordinal));
        Assert.Equal(0, await kho.XoaQuaHanAsync(BatDau.AddDays(-1), Ct));
    }

    [Fact]
    public async Task XoaQuaHan_BangRong_TraKhong()
    {
        db.CanCoDb();
        db.XoaHet();
        var (kho, ctx) = TaoKho(new DongHoGia(BatDau));
        await using var _ = ctx;

        Assert.Equal(0, await kho.XoaQuaHanAsync(BatDau, Ct));
    }

    [Fact]
    public async Task CauDai501KyTu_NemArgumentOutOfRange_KhongGhiDong_Con500KyTuThiGhiDuoc()
    {
        db.CanCoDb();
        db.XoaHet();
        var (kho, ctx) = TaoKho(new DongHoGia(BatDau));
        await using var _ = ctx;

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => kho.GhiAsync(new string('a', CauChuaTraLoi.DoDaiToiDa + 1), Ct));
        Assert.Empty(await DocTatCaAsync());

        await kho.GhiAsync(new string('b', CauChuaTraLoi.DoDaiToiDa), Ct);
        Assert.Equal(CauChuaTraLoi.DoDaiToiDa, Assert.Single(await DocTatCaAsync()).NoiDung.Length);
    }

    [Theory]
    [InlineData("x'); DROP TABLE cau_chua_tra_loi;--")]
    [InlineData("<script>alert(1)</script>")]
    [InlineData("100% _ [x] {0} $ ` ;")]
    [InlineData("Đăng ký 日本語 😀")]
    public async Task KyTuDacBietVaHtml_LuuNguyenVan_BangVanCon(string cau)
    {
        db.CanCoDb();
        db.XoaHet();
        var (kho, ctx) = TaoKho(new DongHoGia(BatDau));
        await using var _ = ctx;

        await kho.GhiAsync(cau, Ct);
        await kho.GhiAsync(cau, Ct);

        var dong = Assert.Single(await DocTatCaAsync());
        Assert.Equal(cau, dong.NoiDung);
        Assert.Equal(2, dong.SoLanGap);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task CauTrong_NemArgumentException_KhongGhi(string cau)
    {
        db.CanCoDb();
        db.XoaHet();
        var (kho, ctx) = TaoKho(new DongHoGia(BatDau));
        await using var _ = ctx;

        await Assert.ThrowsAnyAsync<ArgumentException>(() => kho.GhiAsync(cau, Ct));
        Assert.Empty(await DocTatCaAsync());
    }
}
