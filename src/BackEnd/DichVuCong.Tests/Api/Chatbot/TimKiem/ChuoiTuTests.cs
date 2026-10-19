using System.Text;
using DichVuCong.Api.Features.Chatbot.TimKiem;

namespace DichVuCong.Tests.Api.Chatbot.TimKiem;

public sealed class ChuoiTuTests
{
    private static string Noi(string[] tu) => string.Join(' ', tu);

    [Fact]
    public void Tach_NfdHoaThuongVaKhoangTrangChoCungDayTu()
    {
        var nfd = "Đăng ký".Normalize(NormalizationForm.FormD);

        Assert.Equal("dang ky", Noi(ChuoiTu.Tach(nfd)));
        Assert.Equal("ho tich", Noi(ChuoiTu.Tach("HỘ   TỊCH")));
        Assert.Equal("ho tich", Noi(ChuoiTu.Tach("  hộ\ttịch\n")));
    }

    [Fact]
    public void Tach_KyTuVoHinhBiBoNenKhongCatDoiTu()
    {
        var voHinh = new string((char)0x200E, 1);
        var bom = new string((char)0xFEFF, 1);

        Assert.Equal("trung tam", Noi(ChuoiTu.Tach("Trung t" + voHinh + "âm")));
        Assert.Equal("trung tam", Noi(ChuoiTu.Tach(bom + "Trung" + (char)0x200B + " tâm")));
    }

    [Theory]
    [InlineData("QĐ-UBND", "qd ubnd")]
    [InlineData("Nghị định 54/2024/NĐ-CP", "nghi dinh 54 2024 nd cp")]
    [InlineData("khai sinh, kết hôn?", "khai sinh ket hon")]
    [InlineData("1.001193", "1 001193")]
    [InlineData("", "")]
    [InlineData("?!...", "")]
    public void Tach_DauCauThanhRanhGioiTu(string vao, string mongDoi) => Assert.Equal(mongDoi, Noi(ChuoiTu.Tach(vao)));

    [Fact]
    public void TimDay_KhopTheoTuNguyenKhongTheoChuoiCon()
    {
        var hay = ChuoiTu.Tach("cuoicung toi di nop phien");

        Assert.Equal(-1, ChuoiTu.TimDay(hay, ["cuoi"]));
        Assert.Equal(-1, ChuoiTu.TimDay(hay, ["phi"]));
        Assert.Equal(0, ChuoiTu.TimDay(hay, ["cuoicung", "toi"]));
        Assert.True(ChuoiTu.ChuaDay(hay, ["nop", "phien"]));
        Assert.False(ChuoiTu.ChuaDay(hay, []));
    }

    [Fact]
    public void MoiViTri_TraMoiLanXuatHien()
    {
        var hay = ChuoiTu.Tach("a b a b a");

        Assert.Equal([0, 2], ChuoiTu.MoiViTri(hay, ["a", "b"]));
        Assert.Equal([0, 2, 4], ChuoiTu.MoiViTri(hay, ["a"]));
    }

    [Fact]
    public void KhopDenHet_KetThucDungViTri()
    {
        var hay = ChuoiTu.Tach("toi muon lien he chi nhung");

        Assert.True(ChuoiTu.KhopDenHet(hay, 3, ["lien", "he"]));
        Assert.False(ChuoiTu.KhopDenHet(hay, 2, ["lien", "he"]));
        Assert.False(ChuoiTu.KhopDenHet(hay, -1, ["lien", "he"]));
    }

    private static BangThayDay Bang(params (string Tu, string Thay)[] luat)
    {
        var bang = new BangThayDay();
        foreach (var (tu, thay) in luat)
        {
            bang.Them(ChuoiTu.Tach(tu), ChuoiTu.Tach(thay));
        }

        return bang;
    }

    [Fact]
    public void ThayDay_DamCuoiThangCuoi_DayDaThayKhongBiXetLai()
    {
        var bang = Bang(("cuoi", "ket hon"), ("dam cuoi", "ket hon"));

        Assert.Equal("toi muon ket hon", Noi(ChuoiTu.ThayDay(ChuoiTu.Tach("toi muon dam cuoi"), bang)));
        Assert.Equal("toi muon ket hon", Noi(ChuoiTu.ThayDay(ChuoiTu.Tach("toi muon cuoi"), bang)));
    }

    [Fact]
    public void ThayDay_HaiCumChongNhauChonCumDaiNhatTaiViTriDau()
    {
        var bang = Bang(("a b", "x"), ("b c d", "y"), ("a b c", "z"));

        Assert.Equal("z d", Noi(ChuoiTu.ThayDay(ChuoiTu.Tach("a b c d"), bang)));
    }

    [Fact]
    public void ThayDay_KhongThayGiuaTuVaKhongThayKhiThieuTu()
    {
        var bang = Bang(("cuoi", "ket hon"));

        Assert.Equal("cuoicung", Noi(ChuoiTu.ThayDay(ChuoiTu.Tach("cuoicung"), bang)));
        Assert.Equal("ket hon cung", Noi(ChuoiTu.ThayDay(ChuoiTu.Tach("cuoi cung"), bang)));
        Assert.Equal("a b", Noi(ChuoiTu.ThayDay(ChuoiTu.Tach("a b"), Bang(("a b c", "x")))));
    }

    [Fact]
    public void BangThayDay_LuatThemTruocDuocGiuKhiTrungNguon()
    {
        var bang = Bang(("cuoi", "ket hon"), ("cuoi", "khac"));

        Assert.Equal(1, bang.SoLuat);
        Assert.Equal("ket hon", Noi(ChuoiTu.ThayDay(["cuoi"], bang)));
    }
}
