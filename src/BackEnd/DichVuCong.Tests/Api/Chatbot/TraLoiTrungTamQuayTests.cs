using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>
/// Trả lời Trung tâm (F06 BR-9, BR-10; AC-18…AC-23, AC-26) và quầy/cán bộ (BR-3; AC-3, AC-12, AC-24) trên nguồn Mẫu với các biến thể
/// dữ liệu thử. Quầy và cán bộ chỉ có khi dữ liệu có — không bao giờ đoán.
/// </summary>
public sealed class TraLoiTrungTamQuayTests
{
    private static TroLyHarness Dung(TepDuLieuMau tep) => TroLyHarness.Dung(new NguonDuLieuMau(tep));

    private static string DiaChiMau => TepDuLieuMau.Nhung.TrungTam!.DiaChi;

    // ---- Trung tâm ----

    [Fact]
    public async Task DiaChi_CoDuLieu_KhongCoBanDo_ChiCoDiaChi()
    {
        using var h = Dung(TroLyThu.Nen());

        var cau = await h.HoiAsync("trung tâm ở đâu");

        Assert.Equal("trung-tam", cau.Loai);
        Assert.Equal("dia-chi", cau.Muc);
        Assert.True(cau.ThongTin!.CoDuLieu);
        Assert.Equal(DiaChiMau, cau.ThongTin.DiaChi);
        Assert.Null(cau.ThongTin.BanDo);
        Assert.Null(cau.ThongTin.GioLamViec);
        Assert.Null(cau.LienHe);
    }

    [Fact]
    public async Task DiaChi_CoBanDo_TraBanDo()
    {
        using var h = Dung(TroLyThu.CoBanDo("https://example.gov.vn/ban-do"));

        var cau = await h.HoiAsync("trung tâm ở đâu");

        Assert.Equal("https://example.gov.vn/ban-do", cau.ThongTin!.BanDo);
    }

    [Fact]
    public async Task DiaChi_DoiDuLieuRoiHoiLai_RaDiaChiMoi_KhongSuaCauHoiMau()
    {
        using (var a = Dung(TroLyThu.DoiDiaChi(TroLyThu.DiaChiA)))
        {
            Assert.Equal(TroLyThu.DiaChiA, (await a.HoiAsync("trung tâm ở đâu")).ThongTin!.DiaChi);
        }

        using var b = Dung(TroLyThu.DoiDiaChi(TroLyThu.DiaChiB));

        Assert.Equal(TroLyThu.DiaChiB, (await b.HoiAsync("trung tâm ở đâu")).ThongTin!.DiaChi);
    }

    [Fact]
    public async Task DiaChi_DoiTrongCungDichVu_ThayNgayVi_BangDocMoiLanHoi()
    {
        var tep = TroLyThu.DoiDiaChi(TroLyThu.DiaChiA);
        using var h = Dung(tep);

        Assert.Equal(TroLyThu.DiaChiA, (await h.HoiAsync("trung tâm ở đâu")).ThongTin!.DiaChi);
        tep.TrungTam!.DiaChi = TroLyThu.DiaChiB;

        Assert.Equal(TroLyThu.DiaChiB, (await h.HoiAsync("trung tâm ở đâu")).ThongTin!.DiaChi);
    }

    [Fact]
    public async Task GioLamViec_NamDong_DinhDangHHmm_VaGhiChuNgayNghi()
    {
        var tep = TroLyThu.Nen();
        tep.TrungTam!.GhiChuNgayNghi = "Nghỉ thứ Bảy, Chủ nhật.";
        using var h = Dung(tep);

        var cau = await h.HoiAsync("mấy giờ làm việc");

        Assert.Equal("gio-lam-viec", cau.Muc);
        Assert.True(cau.ThongTin!.CoDuLieu);
        Assert.Equal(5, cau.ThongTin.GioLamViec!.Count);
        Assert.Equal([1, 2, 3, 4, 5], cau.ThongTin.GioLamViec.Select(g => g.Thu));
        Assert.All(cau.ThongTin.GioLamViec, g => Assert.Equal(("07:00", "11:30", "13:30", "17:00"), (g.SangTu, g.SangDen, g.ChieuTu, g.ChieuDen)));
        Assert.Equal("Nghỉ thứ Bảy, Chủ nhật.", cau.ThongTin.GhiChuNgayNghi);
    }

    [Fact]
    public async Task GioLamViec_ChuaCoGio_ChuaCoThongTinKemNutGoi_KhongDoanGio()
    {
        using var h = Dung(TroLyThu.BoGioLamViec());

        var cau = await h.HoiAsync("giờ làm việc");

        Assert.Equal("gio-lam-viec", cau.Muc);
        Assert.False(cau.ThongTin!.CoDuLieu);
        Assert.Null(cau.ThongTin.GioLamViec);
        Assert.Equal(TepDuLieuMau.Nhung.TrungTam!.DienThoai, cau.LienHe!.DienThoai);
    }

    [Fact]
    public async Task DienThoaiVaEmail_DungGiaTriTrongDuLieu()
    {
        using var h = Dung(TroLyThu.Nen());

        var sdt = await h.HoiAsync("số điện thoại trung tâm");
        var email = await h.HoiAsync("email trung tâm");

        Assert.Equal("02723 893 900", sdt.ThongTin!.DienThoai);
        Assert.Equal("cangiuoc@tayninh.gov.vn", email.ThongTin!.Email);
    }

    [Fact]
    public async Task NopTrucTuyen_CoLienKetCongDvc_TraLienKetDungUrl()
    {
        using var h = Dung(TroLyThu.Nen());

        var cau = await h.HoiAsync("nộp hồ sơ trực tuyến ở đâu");

        Assert.Equal("nop-truc-tuyen", cau.Muc);
        Assert.True(cau.ThongTin!.CoDuLieu);
        Assert.Equal("https://dichvucong.gov.vn", cau.ThongTin.LienKet!.Url);
        Assert.Equal("Cổng Dịch vụ công Quốc gia", cau.ThongTin.LienKet.Ten);
    }

    [Fact]
    public async Task NopTrucTuyen_KhongCoLienKetCongDvc_ChuaCoThongTinKemNutGoi()
    {
        using var h = Dung(TroLyThu.BoLienKetCongDvc());

        var cau = await h.HoiAsync("nộp hồ sơ trực tuyến ở đâu");

        Assert.False(cau.ThongTin!.CoDuLieu);
        Assert.Null(cau.ThongTin.LienKet);
        Assert.NotNull(cau.LienHe);
    }

    [Fact]
    public async Task KhongHieu_KhongCoZaloOa_ChiCoNutGoi_CoZaloOa_CoThemNutZalo()
    {
        using var khong = Dung(TroLyThu.Nen());
        using var co = Dung(TroLyThu.CoZaloOa());

        var a = await khong.HoiAsync("giá vàng hôm nay");
        var b = await co.HoiAsync("giá vàng hôm nay");

        Assert.Equal("khong-hieu", a.Loai);
        Assert.Equal("02723 893 900", a.LienHe!.DienThoai);
        Assert.Null(a.LienHe.ZaloOa);
        Assert.Equal(TroLyThu.ZaloThu, b.LienHe!.ZaloOa);
    }

    [Fact]
    public async Task TrungTamTrong_MoiDapAnVanDungDuoc_KhongNemLoi()
    {
        using var h = Dung(TroLyThu.BoTrungTam());

        var diaChi = await h.HoiAsync("trung tâm ở đâu");
        var gio = await h.HoiAsync("mấy giờ làm việc");
        var truc = await h.HoiAsync("nộp hồ sơ trực tuyến ở đâu");
        var khongHieu = await h.HoiAsync("giá vàng hôm nay");
        var quay = await h.HoiAsync("hộ tịch nộp quầy mấy");
        var noiNop = await h.HoiAsync("đăng ký khai sinh nộp ở đâu");
        var chuDe = await h.Service.HoiChuDeAsync(2, null, TestContext.Current.CancellationToken);

        Assert.False(diaChi.ThongTin!.CoDuLieu);
        Assert.Null(diaChi.LienHe);
        Assert.False(gio.ThongTin!.CoDuLieu);
        Assert.False(truc.ThongTin!.CoDuLieu);
        Assert.Equal("khong-hieu", khongHieu.Loai);
        Assert.Null(khongHieu.LienHe);
        Assert.Equal("quay", quay.Loai);
        Assert.Null(quay.TrungTam);
        Assert.Equal("thu-tuc", noiNop.Loai);
        Assert.Null(noiNop.TrungTam);
        Assert.Equal("chu-de", chuDe!.Loai);
    }

    // ---- Quầy và cán bộ ----

    [Fact]
    public async Task Quay_HoTichQuay3()
    {
        using var h = Dung(TroLyThu.CoPhanCong());

        var cau = await h.HoiAsync("hộ tịch nộp quầy mấy");

        Assert.Equal("quay", cau.Loai);
        Assert.Equal("quay", cau.Muc);
        Assert.Equal("Hộ tịch", cau.LinhVuc);
        Assert.Equal(3, cau.Quay);
        Assert.Empty(cau.CanBo!);
        Assert.Equal(DiaChiMau, cau.TrungTam!.DiaChi);
    }

    [Fact]
    public async Task Quay_LinhVucChuaCoDongPhanCong_QuayNull()
    {
        using var h = Dung(TroLyThu.CoPhanCong());

        var cau = await h.HoiAsync("chứng thực nộp quầy mấy");

        Assert.Equal("Chứng thực", cau.LinhVuc);
        Assert.Null(cau.Quay);
        Assert.Empty(cau.CanBo!);
    }

    [Fact]
    public async Task Quay_KhongCoPhanCong_QuayNullVaCanBoRong()
    {
        using var h = Dung(TroLyThu.Nen());

        var quay = await h.HoiAsync("hộ tịch nộp quầy mấy");
        var canBo = await h.HoiAsync("ai phụ trách đất đai");

        Assert.Null(quay.Quay);
        Assert.Empty(quay.CanBo!);
        Assert.Equal("can-bo", canBo.Muc);
        Assert.Null(canBo.Quay);
        Assert.Empty(canBo.CanBo!);
    }

    [Fact]
    public async Task CanBo_AiPhuTrachDatDai_RaDungNguoiOQuay4()
    {
        using var h = Dung(TroLyThu.CoPhanCong());

        var cau = await h.HoiAsync("ai phụ trách đất đai");

        Assert.Equal("can-bo", cau.Muc);
        Assert.Equal(4, cau.Quay);
        Assert.Equal("Chi nhánh thử", cau.NoiTiepNhanChuyen);
        var nguoi = Assert.Single(cau.CanBo!);
        Assert.Equal(new CanBoDto("Nguyễn Văn Cường", "ông", "Chuyên viên", 4, "Phụ trách đất đai"), nguoi);
        Assert.Equal(1, cau.Tong);
    }

    [Fact]
    public async Task CanBo_QuayCuThe_RaNguoiOQuayDo_QuayKhongCoNhanSuThiQuayNull()
    {
        using var h = Dung(TroLyThu.CoPhanCong());

        var q4 = await h.HoiAsync("quầy 4 ai phụ trách");
        var q9 = await h.HoiAsync("quầy 9 ai phụ trách");

        Assert.Equal(4, q4.Quay);
        Assert.Equal("Nguyễn Văn Cường", Assert.Single(q4.CanBo!).HoTen);
        Assert.Null(q9.Quay);
        Assert.Empty(q9.CanBo!);
    }

    [Fact]
    public async Task CanBo_CoQuayChuaCoNhanSu_NeuQuayKhongNeuTen()
    {
        using var h = Dung(TroLyThu.CoPhanCongKhongNhanSu());

        var hoTich = await h.HoiAsync("ai phụ trách hộ tịch");
        var datDai = await h.HoiAsync("ai phụ trách đất đai");

        Assert.Equal("can-bo", hoTich.Muc);
        Assert.Equal(3, hoTich.Quay);
        Assert.Empty(hoTich.CanBo!);
        Assert.Null(datDai.Quay);
        Assert.Empty(datDai.CanBo!);
    }

    [Theory]
    [InlineData("chị Nhung ở quầy mấy", "Trần Thị Nhung")]
    [InlineData("tôi muốn gặp Cường", "Nguyễn Văn Cường")]
    [InlineData("liên hệ chị Nhung", "Trần Thị Nhung")]
    [InlineData("Nguyễn Văn Cường ngồi ở đâu", "Nguyễn Văn Cường")]
    [InlineData("nguyen van cuong", "Nguyễn Văn Cường")]
    [InlineData("anh Cường có ở đó không", "Nguyễn Văn Cường")]
    public async Task TimTheoTen_KhopTenGoiCoAnhChiHayDongTuGoiTen(string cau, string hoTen)
    {
        using var h = Dung(TroLyThu.CoPhanCong());

        var dapAn = await h.HoiAsync(cau);

        Assert.Equal("quay", dapAn.Loai);
        Assert.Equal("can-bo", dapAn.Muc);
        Assert.Equal(hoTen, Assert.Single(dapAn.CanBo!).HoTen);
    }

    [Theory]
    [InlineData("nhưng tôi muốn hỏi khai sinh")]
    [InlineData("Cường")]
    [InlineData("Nhung")]
    [InlineData("hộ tịch hàng ngày làm việc")]
    public async Task TimTheoTen_KhongKhopTenGoiDungMotMinhHayTuThuong(string cau)
    {
        using var h = Dung(TroLyThu.CoPhanCong());

        var dapAn = await h.HoiAsync(cau);

        Assert.NotEqual("can-bo", dapAn.Muc);
        Assert.Empty(dapAn.CanBo ?? []);
    }

    [Fact]
    public async Task Quay_KhongNeuLinhVuc_HoSoNopTaiTrungTamVaGoiYNeuLinhVuc()
    {
        using var h = Dung(TroLyThu.CoPhanCong());

        var cau = await h.HoiAsync("nộp ở quầy nào");

        Assert.Equal("quay", cau.Loai);
        Assert.Null(cau.LinhVuc);
        Assert.Null(cau.Quay);
        Assert.Empty(cau.CanBo!);
        Assert.NotNull(cau.TrungTam);
    }

    [Fact]
    public async Task Quay_LinhVucTuNguCanh_RaQuayCuaThuTucDangNoi()
    {
        using var h = Dung(TroLyThu.CoPhanCong());

        var cau = await h.HoiAsync("nộp quầy mấy", "1.012784");

        Assert.Equal("Đất đai", cau.LinhVuc);
        Assert.Equal(4, cau.Quay);
        Assert.Equal("1.012784", cau.ThuTucDangNoi);
    }

    [Fact]
    public async Task KhongBaoGioCoQuayHayCanBo_KhiDuLieuKhongCo()
    {
        using var h = Dung(TroLyThu.Nen());
        string[] cacCau =
        [
            "hộ tịch nộp quầy mấy", "đất đai nộp quầy mấy", "ai phụ trách đất đai", "ai phụ trách hộ tịch", "quầy 3 ai phụ trách", "nộp ở quầy nào",
            "chị Nhung ở quầy mấy", "gặp Cường", "đăng ký khai sinh nộp ở đâu", "tách thửa nộp ở đâu", "kết hôn nộp ở đâu",
        ];
        string[] chuDeTen = ["Đất đai", "Hộ tịch", "Bảo trợ XH", "Chăn nuôi", "Trẻ em", "Xây dựng"];

        foreach (var cau in cacCau)
        {
            var d = await h.HoiAsync(cau, "1.001193");
            Assert.Null(d.Quay);
            Assert.Empty(d.CanBo ?? []);
        }

        for (var i = 1; i <= chuDeTen.Length; i++)
        {
            var d = await h.Service.HoiChuDeAsync(i, null, TestContext.Current.CancellationToken);
            Assert.Null(d!.Quay);
            Assert.Null(d.NoiTiepNhanChuyen);
        }
    }
}
