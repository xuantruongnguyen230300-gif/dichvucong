using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Api.Features.Chatbot.TimKiem;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;

namespace DichVuCong.Tests.Api.Chatbot.TimKiem;

/// <summary>
/// Chấm điểm trên file mẫu nhúng (408 thủ tục), đối chiếu bảng "Số đo tham khảo" của plan F06 §4.3 và hai nhóm câu của AC-5, AC-10, AC-15.
/// </summary>
public sealed class ChamDiemTests
{
    private static readonly ChamDiemOptions Opt = new();
    private static readonly Lazy<Task<ChiMucTroLy>> ChiMucNen = new(() => DungChiMucAsync(TepDuLieuMau.Nhung));
    private static readonly Lazy<Task<ChiMucTroLy>> ChiMucCauMau = new(() => DungChiMucAsync(TroLyThu.CoCauMau()));

    private static Task<ChiMucTroLy> DungChiMucAsync(TepDuLieuMau tep)
        => DungChiMuc.DungAsync(new NguonDuLieuMau(tep), 1, CancellationToken.None);

    private static CauDaPhanTich PhanTich(ChiMucTroLy cm, string cau) => PhanTichCauHoi.Chay(CheThongTinCaNhan.Bo(cau), cm, Opt);

    private static async Task<(IReadOnlyList<UngVien> Ung, CauDaPhanTich Cau)> TimAsync(string cau)
    {
        var cm = await ChiMucNen.Value;
        var pt = PhanTich(cm, cau);

        return (ChamDiem.TimThuTuc(cm, pt, Opt), pt);
    }

    [Theory]
    [InlineData("khai sinh", "1.001193", 0.78, "1.004884", 0.66, "1.003583", 0.52)]
    [InlineData("khai tu", "1.000656", 0.76, "1.005461", 0.64, "1.000419", 0.50)]
    [InlineData("ket hon", "1.000894", 0.82, "1.004746", 0.72, "1.000593", 0.59)]
    public async Task SoDoThamKhao_BaThuTucDau(string cau, string ma1, double d1, string ma2, double d2, string ma3, double d3)
    {
        var (ung, _) = await TimAsync(cau);

        Assert.Equal([ma1, ma2, ma3], ung.Take(3).Select(u => u.ThuTuc.Ma));
        Assert.Equal(d1, ung[0].Dice, 0.01);
        Assert.Equal(d2, ung[1].Dice, 0.01);
        Assert.Equal(d3, ung[2].Dice, 0.01);
        Assert.All(ung.Take(3), u => Assert.Equal(1.0, u.Phu, 0.001));
    }

    [Fact]
    public async Task KetHon_DuNamThuTucCoChuKetHonVaBanGocDungTruoc()
    {
        var (ung, _) = await TimAsync("ket hon");

        var lienQuan = ung.Where(u => u.DuLienQuan).Take(5).ToList();

        Assert.Equal(["1.000894", "1.004746", "1.000593", "2.000806", "2.000513"], lienQuan.Select(u => u.ThuTuc.Dto.Ma));
        Assert.All(lienQuan, u => Assert.Contains("kết hôn", u.ThuTuc.Dto.Ten, StringComparison.OrdinalIgnoreCase));
        // Plan tính tay 0,51 và 0,47; công thức đúng cho 0,48 và 0,45 (ba thủ tục đầu trùng plan tới 0,01).
        Assert.Equal(0.51, lienQuan[3].Dice, 0.04);
        Assert.Equal(0.47, lienQuan[4].Dice, 0.04);
    }

    [Fact]
    public async Task KhaiSjnh_SinhLaTuDaSua_VanDuChacMaDiemThapHon()
    {
        var (ung, pt) = await TimAsync("khai sjnh");

        Assert.Contains(pt.TuNoiDung, t => t is { Tu: "sinh", DaSua: true });
        Assert.Equal("1.001193", ung[0].ThuTuc.Ma);
        Assert.Equal(0.58, ung[0].Dice, 0.01);
        Assert.Equal(0.74, ung[0].Phu, 0.01);
        Assert.True(ung[0].DuChac);
    }

    [Fact]
    public async Task DangKyKhaiSinh_DiemTuyetDoi()
    {
        var (ung, _) = await TimAsync("dang ky khai sinh");

        Assert.Equal("1.001193", ung[0].ThuTuc.Ma);
        Assert.Equal(1.0, ung[0].Dice, 0.001);
    }

    [Theory]
    [InlineData("gia vang hom nay")]
    [InlineData("giá vàng hôm nay")]
    [InlineData("hôm nay trời đẹp quá")]
    public async Task CauNgoaiPhamVi_KhongThuTucNaoDuLienQuan(string cau)
    {
        var (ung, _) = await TimAsync(cau);

        Assert.DoesNotContain(ung, u => u.DuLienQuan);
        Assert.True(ung.Count == 0 || ung.Max(u => u.Phu) < Opt.NguongLienQuanPhu);
    }

    [Theory]
    [InlineData("xem bói 12 05 2026")]
    [InlineData("thời tiết ngày 12 05 2026")]
    [InlineData("2026")]
    [InlineData("12/05/2026")]
    public async Task CauChiCoSoVaNgayThang_KhongThuTucNaoDuLienQuan(string cau)
    {
        var (ung, pt) = await TimAsync(cau);

        Assert.DoesNotContain(pt.TuNoiDung, t => t.Tu.All(char.IsAsciiDigit));
        Assert.DoesNotContain(ung, u => u.DuLienQuan);
    }

    [Fact]
    public async Task XemBoi_MotTuKhopPhu064_BiChanBoiDieuKienHaiTu()
    {
        var (ung, _) = await TimAsync("xem boi");

        Assert.Equal(0.64, ung.Max(u => u.Phu), 0.01);
        Assert.All(ung, u => Assert.Equal(1, u.SoTuKhop));
        Assert.DoesNotContain(ung, u => u.DuLienQuan);
    }

    [Fact]
    public async Task MaThuTucTrongCau_LaKetQuaDuyNhatChacChan()
    {
        var (ung, pt) = await TimAsync("1.001193 mấy ngày");

        var u = Assert.Single(ung);
        Assert.Equal("1.001193", u.ThuTuc.Ma);
        Assert.True(u.DuChac);
        Assert.Equal(1.0, u.Dice);
        Assert.Equal("thoi-han", pt.MucHoi);
    }

    [Theory]
    [InlineData("1.000656")]
    [InlineData("(1.000656)")]
    [InlineData("1.000656.")]
    [InlineData("mã 1.000656, nhé")]
    public async Task MaThuTuc_BoDauCauHaiDauVaDauChamCuoi(string cau)
    {
        var (ung, _) = await TimAsync(cau);

        Assert.Equal("1.000656", Assert.Single(ung).ThuTuc.Ma);
    }

    [Fact]
    public async Task MaDvc_NhanRaThuTuc()
    {
        var cm = await ChiMucNen.Value;
        var thuTuc = cm.ThuTucs.First(t => !string.IsNullOrEmpty(t.MaDvc) && t.Ma == "1.000894");

        var (ung, _) = await TimAsync(thuTuc.MaDvc!.ToLowerInvariant() + " phí");

        Assert.Equal("1.000894", Assert.Single(ung).ThuTuc.Ma);
    }

    [Fact]
    public async Task TuDongNghiaVaVietTat_MoRongCauHoi()
    {
        var cm = await ChiMucNen.Value;

        Assert.Equal("ket hon", string.Join(' ', PhanTich(cm, "cưới vợ").Day));
        Assert.Equal("dang ky ket hon", string.Join(' ', PhanTich(cm, "đk kết hôn").Day));
        Assert.Equal("can cuoc cong dan", string.Join(' ', PhanTich(cm, "CCCD").Day));
        Assert.Equal("dang ky ket hon", string.Join(' ', PhanTich(cm, "ĐK  kết hôn").Day));
    }

    [Fact]
    public async Task TuDem_KhongDoiTuNoiDung()
    {
        var cm = await ChiMucNen.Value;

        var khong = PhanTich(cm, "làm giấy khai sinh cần giấy tờ gì");
        var co = PhanTich(cm, "cho tôi hỏi làm giấy khai sinh cần giấy tờ gì ạ");

        Assert.Equal(khong.TuNoiDung, co.TuNoiDung);
        Assert.Equal(khong.TuMau, co.TuMau);
        Assert.Equal("ho-so", co.MucHoi);
    }

    [Theory]
    [InlineData("nộp hồ sơ trực tuyến ở đâu", "noi-nop")]
    [InlineData("đăng ký khai sinh nộp ở đâu", "noi-nop")]
    [InlineData("khai sinh mất bao lâu", "thoi-han")]
    [InlineData("khai sinh phí bao nhiêu", "phi")]
    [InlineData("khai sinh gồm những bước nào", "trinh-tu")]
    [InlineData("khai sinh nhận được gì", "ket-qua")]
    [InlineData("khai sinh theo căn cứ pháp lý nào", "can-cu")]
    [InlineData("khai sinh cần giấy tờ gì", "ho-so")]
    public async Task MucHoi_NhanDungMucVaNoiNopThangHoSo(string cau, string muc)
    {
        var cm = await ChiMucNen.Value;

        Assert.Equal(muc, PhanTich(cm, cau).MucHoi);
    }

    [Fact]
    public async Task CumMotTu_SoTheoTuNguyen_PhiKhacPhien()
    {
        var cm = await ChiMucNen.Value;

        Assert.Equal("phi", PhanTich(cm, "khai sinh có phí không").MucHoi);
        Assert.Null(PhanTich(cm, "phiên họp").MucHoi);
    }

    [Fact]
    public async Task TimMau_DieuKienTachThuaVoiCauMauThem_DiemMotChinXamBaThangCauHopThua()
    {
        var cm = await ChiMucCauMau.Value;

        var khop = ChamDiem.TimMau(cm, PhanTich(cm, "dieu kien tach thua"), Opt);

        Assert.NotNull(khop);
        Assert.Equal(100, khop.Cach.CauThuTu);
        Assert.Equal(0.93, khop.Dice, 0.01);
    }

    [Theory]
    [InlineData("van phong nam cho nao", 7)]
    [InlineData("mấy giờ làm việc", 8)]
    [InlineData("số điện thoại trung tâm", 9)]
    [InlineData("email trung tâm", 10)]
    [InlineData("nộp hồ sơ trực tuyến ở đâu", 11)]
    [InlineData("trung tâm ở đâu", 7)]
    public async Task TimMau_CauTrungTam(string cau, int cauMau)
    {
        var cm = await ChiMucNen.Value;

        var khop = ChamDiem.TimMau(cm, PhanTich(cm, cau), Opt);

        Assert.NotNull(khop);
        Assert.Equal(cauMau, khop.Cach.CauThuTu);
        Assert.Equal(1.0, khop.Dice, 0.001);
    }

    [Theory]
    [InlineData("tach thua dat")]
    [InlineData("tach thua can giay to gi")]
    [InlineData("tách thửa cần giấy tờ gì")]
    [InlineData("khai sinh")]
    [InlineData("giá vàng hôm nay")]
    public async Task TimMau_CauNganHayCauThuTuc_KhongPhaiCauMau(string cau)
    {
        var cm = await ChiMucCauMau.Value;

        Assert.Null(ChamDiem.TimMau(cm, PhanTich(cm, cau), Opt));
    }

    [Fact]
    public async Task ChiMuc_TuDienCoTuCuaMoiNguon()
    {
        var cm = await ChiMucNen.Value;

        foreach (var tu in new[] { "khai", "sinh", "tach", "thua", "quay", "phu", "trach", "cuoi", "ubnd", "dk" })
        {
            Assert.True(cm.TuDien.Co(tu), tu);
        }

        Assert.Equal(408, cm.ThuTucs.Count);
        Assert.Equal(45, cm.CachHois.Count);
        Assert.Equal(6, cm.ChuDes.Count);
    }

    [Fact]
    public async Task ChiMuc_ThuTucTheoThuTuTangDan_TapTuKhongCoTuDemHayThuTuc()
    {
        var cm = await ChiMucNen.Value;

        Assert.Equal(cm.ThuTucs.Select(t => t.ThuTu).Order(), cm.ThuTucs.Select(t => t.ThuTu));
        var khaiSinh = cm.TheoMa("1.001193")!;
        Assert.Equal(["dang", "khai", "ky", "sinh"], khaiSinh.TapTu);
        Assert.DoesNotContain(cm.ThuTucs, t => t.TapTu.Contains("thu") || t.TapTu.Contains("tuc") || t.TapTu.Contains("va"));
    }

    [Fact]
    public async Task Idf_TuHiemNangHonTuPhoBien_TuLaBangNuaLnNMotCong()
    {
        var cm = await ChiMucNen.Value;

        Assert.True(cm.Idf("khai") > cm.Idf("dang"));
        Assert.Equal(0.5 * Math.Log(1 + 408), cm.Idf("tuxyzkhongco"), 6);
        Assert.Equal(Math.Log(1 + (408.0 / cm.ThuTucCoTu("khai").Count)), cm.Idf("khai"), 6);
    }

    [Fact]
    public async Task XepHangXacDinh_DaoThuTuDocCuaNguonChoCungDanhSach()
    {
        var tep = TepDuLieuMau.Nhung;
        var cm1 = await DungChiMuc.DungAsync(new NguonDuLieuMau(tep), 1, CancellationToken.None);
        var cm2 = await DungChiMuc.DungAsync(new NguonDaoNguoc(new NguonDuLieuMau(tep)), 1, CancellationToken.None);

        foreach (var cau in new[] { "khai sinh", "ket hon", "tach thua", "dang ky", "giay", "tro cap" })
        {
            var a = ChamDiem.TimThuTuc(cm1, PhanTich(cm1, cau), Opt).Select(u => (u.ThuTuc.Ma, u.Dice));
            var b = ChamDiem.TimThuTuc(cm2, PhanTich(cm2, cau), Opt).Select(u => (u.ThuTuc.Ma, u.Dice));
            Assert.Equal(a, b);
        }
    }
}
