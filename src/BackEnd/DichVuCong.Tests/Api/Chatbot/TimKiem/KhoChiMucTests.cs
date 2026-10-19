using DichVuCong.Api.Features.Chatbot.TimKiem;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;

namespace DichVuCong.Tests.Api.Chatbot.TimKiem;

/// <summary>Chỉ mục giữ theo phiên bản dữ liệu: dựng lại khi phiên bản đổi, không dựng lại khi không đổi, một lần cho nhiều yêu cầu cùng lúc (plan F06 §4.2).</summary>
public sealed class KhoChiMucTests
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static NguonDuLieuMau Nguon() => new(TepDuLieuMau.Nhung);

    [Fact]
    public async Task CungPhienBan_DungMotLanVaTraCungChiMuc()
    {
        var kho = new KhoChiMuc();
        var phienBan = new PhienBanGia { GiaTri = 7 };
        var nguon = Nguon();

        var a = await kho.LayAsync(nguon, phienBan, Ct);
        var b = await kho.LayAsync(nguon, phienBan, Ct);

        Assert.Same(a, b);
        Assert.Equal(1, kho.SoLanDung);
        Assert.Equal(7, a.PhienBan);
    }

    [Fact]
    public async Task PhienBanDoi_DungLai_RoiGiuBanMoi()
    {
        var kho = new KhoChiMuc();
        var phienBan = new PhienBanGia { GiaTri = 1 };
        var nguon = Nguon();

        var a = await kho.LayAsync(nguon, phienBan, Ct);
        phienBan.GiaTri = 2;
        var b = await kho.LayAsync(nguon, phienBan, Ct);
        var c = await kho.LayAsync(nguon, phienBan, Ct);

        Assert.NotSame(a, b);
        Assert.Same(b, c);
        Assert.Equal(2, kho.SoLanDung);
        Assert.Equal(2, c.PhienBan);
    }

    [Fact]
    public async Task HaiMuoiYeuCauSongSongCungPhienBanMoi_DungDungMotLan()
    {
        var kho = new KhoChiMuc();
        var phienBan = new PhienBanGia { GiaTri = 5 };
        var nguon = new NguonDemTruyCap(Nguon());

        var cacChiMuc = await Task.WhenAll(Enumerable.Range(0, 20).Select(_ => Task.Run(() => kho.LayAsync(nguon, phienBan, Ct), Ct)));

        Assert.Equal(1, kho.SoLanDung);
        Assert.All(cacChiMuc, c => Assert.Same(cacChiMuc[0], c));
        // Mỗi lần dựng đọc 7 tập (lĩnh vực, thủ tục, câu mẫu, cách hỏi, đồng nghĩa, viết tắt, chủ đề); không đọc các bảng nhỏ.
        Assert.Equal(7, nguon.SoLanTruyCap);
    }

    [Fact]
    public async Task DungLoi_KhongGiuLaiVaLanSauThuLai()
    {
        var kho = new KhoChiMuc();
        var phienBan = new PhienBanGia { GiaTri = 3 };
        using var huy = new CancellationTokenSource();
        await huy.CancelAsync();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => kho.LayAsync(Nguon(), phienBan, huy.Token));
        var chiMuc = await kho.LayAsync(Nguon(), phienBan, Ct);

        Assert.Equal(3, chiMuc.PhienBan);
    }

    [Fact]
    public async Task DuLieuDoi_ChiMucMoiThayDuLieuMoi()
    {
        var kho = new KhoChiMuc();
        var phienBan = new PhienBanGia { GiaTri = 1 };
        var cu = await kho.LayAsync(new NguonDuLieuMau(TroLyThu.Nen()), phienBan, Ct);
        phienBan.GiaTri = 2;
        var moi = await kho.LayAsync(new NguonDuLieuMau(TroLyThu.BotMotChuDe()), phienBan, Ct);

        Assert.Equal(6, cu.ChuDes.Count);
        Assert.Equal(5, moi.ChuDes.Count);
    }
}
