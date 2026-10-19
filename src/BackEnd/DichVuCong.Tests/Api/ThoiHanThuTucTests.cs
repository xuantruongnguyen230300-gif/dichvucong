using DichVuCong.Api.Features.ChiTietThuTuc;

namespace DichVuCong.Tests.Api;

/// <summary>Hàm thuần chọn thời hạn rõ ràng (plan F03 §3.1; F04 dùng lại cho danh mục).</summary>
public sealed class ThoiHanThuTucTests
{
    [Theory]
    [InlineData("Khác")]
    [InlineData("1 Khác")]
    [InlineData("  3  KHÁC ")]
    [InlineData("khac")]
    [InlineData("12Khac")]
    [InlineData("KHAC\t")]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("\t\n")]
    public void LamRo_ChiLaKhacHoacRong_TraNull(string thoiHan) => Assert.Null(ThoiHanThuTuc.LamRo(thoiHan));

    [Fact]
    public void LamRo_Null_TraNull() => Assert.Null(ThoiHanThuTuc.LamRo(null));

    [Fact]
    public void LamRo_DangNfd_VanNhanRaKhac()
    {
        // "Khác" với dấu sắc tách rời (a + U+0301).
        var nfd = "Kha" + (char)0x0301 + "c";

        Assert.Null(ThoiHanThuTuc.LamRo(nfd));
        Assert.Null(ThoiHanThuTuc.LamRo("2 " + nfd.ToUpperInvariant()));
    }

    [Theory]
    [InlineData("5 ngày làm việc")]
    [InlineData("Khác biệt theo quy định")]
    [InlineData("Không quá 3 ngày. Khác")]
    [InlineData("  10 ngày  ")]
    [InlineData("Trong ngày")]
    public void LamRo_ThoiHanThat_GiuNguyenVan(string thoiHan) => Assert.Equal(thoiHan, ThoiHanThuTuc.LamRo(thoiHan));

    [Fact]
    public void Chon_ThoiHanThuTucRo_DungNoDuCachThucCoThoiHan()
    {
        Assert.Equal("5 ngày làm việc", ThoiHanThuTuc.Chon("5 ngày làm việc", ["1 ngày", "2 ngày"]));
    }

    [Fact]
    public void Chon_ThoiHanThuTucKhongRo_LayCachThucRoDauTien()
    {
        var ketQua = ThoiHanThuTuc.Chon("1 Khác", [null, "Khác", " ", "3 ngày làm việc", "5 ngày"]);

        Assert.Equal("3 ngày làm việc", ketQua);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("Khác")]
    [InlineData("2 Khác")]
    [InlineData("")]
    public void Chon_KhongCoCachThucRo_TraNull(string? thoiHan)
    {
        Assert.Null(ThoiHanThuTuc.Chon(thoiHan, []));
        Assert.Null(ThoiHanThuTuc.Chon(thoiHan, [null, "Khác", "1 Khác", ""]));
    }

    [Fact]
    public void Chon_ThoiHanThuTucNull_LayTuCachThuc() =>
        Assert.Equal("7 ngày", ThoiHanThuTuc.Chon(null, ["7 ngày"]));

    [Fact]
    public void Chon_DanhSachCachThucNull_NemLoiThamSo() =>
        Assert.Throws<ArgumentNullException>(() => ThoiHanThuTuc.Chon("Khác", null!));

    [Fact]
    public void LamRo_ChuoiRatDai_KhongTreo()
    {
        // Chuỗi bất thường dài hàng chục nghìn khoảng trắng: phải trả lời ngay, không chạm thời gian chờ của regex.
        var dai = new string(' ', 50_000) + "x";

        Assert.Equal(dai, ThoiHanThuTuc.LamRo(dai));
    }
}
