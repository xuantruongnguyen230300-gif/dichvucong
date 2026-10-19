using DichVuCong.Api.Features.Chatbot.DocCauTraLoi;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Entities;
using DichVuCong.Data.Mau;

namespace DichVuCong.Tests.Api.Chatbot.DocCauTraLoi;

/// <summary>
/// Test hợp đồng của <see cref="VietTatDocService"/> (F07 T01; plan F00 §9.4 R7): cùng các ca chạy trên mọi nguồn dữ liệu.
/// Lớp con chỉ nói cách dựng <see cref="INguonDuLieu"/> từ một <see cref="TepDuLieuMau"/>.
/// </summary>
public abstract class VietTatDocServiceContract
{
    private static readonly DateTimeOffset ThoiDiem = new(2026, 10, 13, 0, 0, 0, TimeSpan.Zero);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    protected abstract INguonDuLieu TaoNguon(TepDuLieuMau tep);

    [Fact]
    public async Task DuLieuMau_MuoiHaiDongDungThuTu_ChiHaiTruong()
    {
        var ds = await new VietTatDocService(TaoNguon(TroLyThu.Nen())).LayAsync(Ct);

        Assert.Equal(12, ds.Count);
        Assert.Equal(new VietTatDocDto("TTHC", "thủ tục hành chính"), ds[0]);
        Assert.Contains(new VietTatDocDto("đk", "đăng ký"), ds);
        Assert.Contains(new VietTatDocDto("QĐ-UBND", "quyết định Ủy ban nhân dân"), ds);
        Assert.Equal(TepDuLieuMau.Nhung.VietTat.OrderBy(v => v.ThuTu).Select(v => v.ChuVietTat), ds.Select(d => d.ChuVietTat));
    }

    [Fact]
    public async Task SapTheoThuTuKhongTheoThuTuThem()
    {
        var tep = new TepDuLieuMau { ThoiDiem = ThoiDiem };
        tep.VietTat.Add(new VietTat { ThuTu = 3, ChuVietTat = "C", ChuVietTatTimKiem = "c", DayDu = "cờ" });
        tep.VietTat.Add(new VietTat { ThuTu = 1, ChuVietTat = "A", ChuVietTatTimKiem = "a", DayDu = "á" });
        tep.VietTat.Add(new VietTat { ThuTu = 2, ChuVietTat = "B", ChuVietTatTimKiem = "b", DayDu = "bê" });

        var ds = await new VietTatDocService(TaoNguon(tep)).LayAsync(Ct);

        Assert.Equal(["A", "B", "C"], ds.Select(d => d.ChuVietTat));
    }

    [Fact]
    public async Task BangRong_TraDanhSachRong()
    {
        var ds = await new VietTatDocService(TaoNguon(new TepDuLieuMau { ThoiDiem = ThoiDiem })).LayAsync(Ct);

        Assert.Empty(ds);
    }
}
