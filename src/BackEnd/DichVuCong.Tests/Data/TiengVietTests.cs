using DichVuCong.Data.Text;

namespace DichVuCong.Tests.Data;

public class TiengVietTests
{
    private const char Lrm = (char)0x200E;
    private const char Rlm = (char)0x200F;
    private const char Zwnj = (char)0x200C;
    private const char Zwj = (char)0x200D;

    public static TheoryData<string, string, string> BoMau => new()
    {
        { "Đăng ký khai sinh", "Dang ky khai sinh", "dang ky khai sinh" },
        { "  HỘ   TỊCH ", "  HO   TICH ", "ho tich" },
        { "Chứng thực bản sao", "Chung thuc ban sao", "chung thuc ban sao" },
        { "Thủy lợi – Thuỷ sản", "Thuy loi – Thuy san", "thuy loi – thuy san" },
        { "Đất đai".Normalize(System.Text.NormalizationForm.FormD), "Dat dai", "dat dai" },
        { "ĐƯỜNG Ở", "DUONG O", "duong o" },
        { "", "", "" },
        { "a\u00A0b\tc\u0085d\uFEFFe\u200Bf", "a\u00A0b\tc\u0085d\uFEFFe\u200Bf", "a b c def" },
        { $"đăng k{Lrm}ý", $"dang k{Lrm}y", "dang ky" },
        { $"a{Rlm}b{Zwnj}c{Zwj}d", $"a{Rlm}b{Zwnj}c{Zwj}d", "abcd" },
    };

    [Theory]
    [InlineData("", "")]
    [InlineData("abc", "abc")]
    public void BoKyTuVoHinh_giu_nguyen_chuoi_khong_co_ky_tu_vo_hinh(string vao, string ra)
        => Assert.Equal(ra, TiengViet.BoKyTuVoHinh(vao));

    [Fact]
    public void BoKyTuVoHinh_bo_dau_dinh_huong_chu()
        => Assert.Equal("đăng ký", TiengViet.BoKyTuVoHinh($"đăng k{Lrm}ý"));

    [Fact]
    public void BoKyTuVoHinh_bo_het_tap_U200B_den_U200F_va_UFEFF()
    {
        var vao = string.Concat(Enumerable.Range(0x200B, 5).Select(m => (char)m)) + "x" + (char)0xFEFF;
        Assert.Equal("x", TiengViet.BoKyTuVoHinh(vao));
    }

    [Fact]
    public void BoKyTuVoHinh_khong_bo_khoang_trang_thuong()
        => Assert.Equal("a b", TiengViet.BoKyTuVoHinh("a b"));

    [Fact]
    public void BoKyTuVoHinh_null_bi_tu_choi()
        => Assert.Throws<ArgumentNullException>(() => TiengViet.BoKyTuVoHinh(null!));

    [Theory]
    [MemberData(nameof(BoMau))]
    public void BoDau_theo_bo_mau(string vao, string boDau, string _)
        => Assert.Equal(boDau, TiengViet.BoDau(vao));

    [Theory]
    [MemberData(nameof(BoMau))]
    public void ChuanHoaTimKiem_theo_bo_mau(string vao, string _, string chuanHoa)
        => Assert.Equal(chuanHoa, TiengViet.ChuanHoaTimKiem(vao));

    [Fact]
    public void BoDau_tra_ve_NFC()
        => Assert.True(TiengViet.BoDau("Đất đai".Normalize(System.Text.NormalizationForm.FormD)).IsNormalized());

    [Fact]
    public void Null_bi_tu_choi()
        => Assert.Throws<ArgumentNullException>(() => TiengViet.BoDau(null!));

    [Theory]
    [InlineData("Hộ tịch", "ho-tich")]
    [InlineData("Đăng ký, quản lý cư trú", "dang-ky-quan-ly-cu-tru")]
    [InlineData("Thủy lợi – Thuỷ sản", "thuy-loi-thuy-san")]
    [InlineData("bảo vệ quyền lợi người tiêu dùng", "bao-ve-quyen-loi-nguoi-tieu-dung")]
    [InlineData("  Đất   đai ", "dat-dai")]
    [InlineData("– – –", "")]
    [InlineData("", "")]
    public void TaoMaDuongDan_theo_bo_mau(string vao, string ra)
        => Assert.Equal(ra, TiengViet.TaoMaDuongDan(vao));

    [Fact]
    public void TaoMaDuongDan_bo_ky_tu_vo_hinh()
        => Assert.Equal("dang-ky", TiengViet.TaoMaDuongDan($"đăng k{Lrm}ý"));
}
