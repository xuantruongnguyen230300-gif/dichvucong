using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Api.Features.Chatbot.TraLoi;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>
/// Dịch vụ trả lời ghép đủ năm bước (F06 BR-1, BR-7, BR-8, BR-11; plan §4.5–§4.7) trên nguồn Mẫu: ngữ cảnh, ghi kho câu chưa trả lời,
/// log không chứa nội dung câu, chủ đề gợi ý, cắt đáp án theo giới hạn từng mục.
/// </summary>
public sealed class TroLyServiceTests
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static TroLyHarness Dung(TepDuLieuMau tep, Action<IServiceCollection>? tuyChinh = null)
        => TroLyHarness.Dung(new NguonDuLieuMau(tep), tuyChinh);

    // ---- Ngữ cảnh thuTucDangNoi (plan §4.7) ----

    [Fact]
    public async Task NguCanh_SauKetHonLaThuTucKetHon_RoiCanGiayToGiTraHoSoCuaNo()
    {
        using var h = Dung(TroLyThu.Nen());

        var danhSach = await h.HoiAsync("kết hôn");
        var hoSo = await h.HoiAsync("cần giấy tờ gì", danhSach.ThuTucDangNoi);

        Assert.Equal("1.000894", danhSach.ThuTucDangNoi);
        Assert.Equal("ho-so", hoSo.Muc);
        Assert.Equal("1.000894", hoSo.ThuTuc!.Ma);
        Assert.Equal("1.000894", hoSo.ThuTucDangNoi);
    }

    [Theory]
    [InlineData("mấy giờ làm việc")]
    [InlineData("hộ tịch nộp quầy mấy")]
    [InlineData("giá vàng hôm nay")]
    [InlineData("số điện thoại trung tâm")]
    public async Task NguCanh_TrungTamQuayKhongHieu_GiuNguyenNguCanhGuiLen(string cau)
    {
        using var h = Dung(TroLyThu.Nen());

        var d = await h.HoiAsync(cau, "1.001193");

        Assert.Equal("1.001193", d.ThuTucDangNoi);
    }

    [Fact]
    public async Task NguCanh_MaKhongCoTrongDuLieuHaySaiDinhDang_BiBoVaKhongPhatLai()
    {
        using var h = Dung(TroLyThu.Nen());

        foreach (var ma in new[] { "9.999999", "", "..", "khong hop le!", new string('1', 40), "1.001193\n" })
        {
            var d = await h.HoiAsync("giá vàng hôm nay", ma);
            Assert.Null(d.ThuTucDangNoi);
        }
    }

    [Fact]
    public async Task NguCanh_MaVietThuong_ChuanHoaVeMaTrongDuLieu()
    {
        using var h = Dung(TroLyThu.CoThuTucDai());

        var d = await h.HoiAsync("mấy ngày", "dai.001");

        Assert.Equal("DAI.001", d.ThuTucDangNoi);
        Assert.Equal("DAI.001", d.ThuTuc!.Ma);
    }

    [Fact]
    public async Task NguCanh_ThuTucDuChacTrongCauThangThuTucDangNoi()
    {
        using var h = Dung(TroLyThu.Nen());

        var d = await h.HoiAsync("đăng ký kết hôn mấy ngày", "1.001193");

        Assert.Equal("1.000894", d.ThuTuc!.Ma);
        Assert.Equal("1.000894", d.ThuTucDangNoi);
    }

    [Fact]
    public async Task CauHoiMau_ThuTucLienQuan_VaNguCanhMotThuTuc()
    {
        using var h = Dung(TroLyThu.CoCauMau());

        var d = await h.HoiAsync("dieu kien tach thua");

        Assert.Equal("cau-hoi-mau", d.Loai);
        Assert.Equal(TroLyThu.TraLoiMauThem, d.TraLoi);
        Assert.Equal("1.012784", Assert.Single(d.DanhSachThuTuc!).Ma);
        Assert.Equal("1.012784", d.ThuTucDangNoi);
    }

    [Fact]
    public async Task ThuTucKhac_TuTimKiemToiDaBa_KhongCoKhiNhanTuMaHayNguCanh()
    {
        using var h = Dung(TroLyThu.Nen());

        var timKiem = await h.HoiAsync("khai sinh cần giấy tờ gì");
        var theoMa = await h.HoiAsync("1.001193 cần giấy tờ gì");
        var nguCanh = await h.HoiAsync("cần giấy tờ gì", "1.001193");

        Assert.InRange(timKiem.ThuTucKhac!.Count, 1, 3);
        Assert.DoesNotContain(timKiem.ThuTucKhac, t => t.Ma == "1.001193");
        Assert.Empty(theoMa.ThuTucKhac!);
        Assert.Empty(nguCanh.ThuTucKhac!);
    }

    [Fact]
    public async Task ThuTucNgan_ChiCoTruongManHinhDung()
    {
        using var h = Dung(TroLyThu.Nen());

        var d = await h.HoiAsync("khai sinh cần giấy tờ gì");

        Assert.Equal(new ThuTucNganDto("1.001193", "Thủ tục đăng ký khai sinh", "Hộ tịch", "toan-trinh", true, true), d.ThuTuc);
    }

    // ---- Ghi kho câu chưa trả lời (BR-7, BR-8) ----

    [Fact]
    public async Task Kho_ChiKhongHieuMoiGhi_VaNoiDungLaBanDaChe()
    {
        using var h = Dung(TroLyThu.Nen());

        await h.HoiAsync("khai sinh");
        await h.HoiAsync("trung tâm ở đâu");
        await h.HoiAsync("hộ tịch nộp quầy mấy");
        Assert.Empty(h.Kho.CacCau);

        await h.HoiAsync("số 0912345678 của tôi nộp hồ sơ chưa");
        await h.HoiAsync("CCCD 079123456789, email nguyenvana@gmail.com, hồ sơ của tôi đâu");
        await h.HoiAsync("mấy ngày");

        Assert.Equal(
            [
                "số 09******78 của tôi nộp hồ sơ chưa",
                "CCCD 07********89, email n***@gmail.com, hồ sơ của tôi đâu",
                "mấy ngày",
            ],
            h.Kho.CacCau);
    }

    [Fact]
    public async Task Kho_HoiTinhTrangHoSoCaNhan_DiThangBuocNamVaGhiKho()
    {
        using var h = Dung(TroLyThu.Nen());

        var d = await h.HoiAsync("hồ sơ của tôi đâu rồi");

        Assert.Equal("khong-hieu", d.Loai);
        Assert.Single(h.Kho.CacCau);
    }

    [Fact]
    public async Task Kho_HaiLanGiaVangHomNay_KhoMauMotDongHaiLanGap()
    {
        var kho = new KhoCauChuaTraLoiMau(TimeProvider.System);
        using var h = Dung(TroLyThu.Nen(), s => s.AddSingleton<IKhoCauChuaTraLoi>(kho));

        await h.HoiAsync("giá vàng hôm nay");
        await h.HoiAsync("GIÁ VÀNG HÔM NAY");

        var dong = Assert.Single(kho.ChupCacDong());
        Assert.Equal(2, dong.SoLanGap);
    }

    [Fact]
    public async Task Kho_NemLoi_VanTraKhongHieu_VaLogKhongChuaNoiDungCau()
    {
        var logKho = new BoGhiLog(typeof(BuocKhongHieu).FullName!);
        var logDichVu = new BoGhiLog(typeof(TroLyService).FullName!);
        using var h = Dung(TroLyThu.Nen(), s => s.AddLogging(b => b.AddProvider(logKho).AddProvider(logDichVu)));
        h.Kho.NemLoi = true;

        var d = await h.HoiAsync("số 0912345678 của tôi nộp hồ sơ chưa");

        Assert.Equal("khong-hieu", d.Loai);
        var canhBao = await logKho.DocAsync();
        Assert.Equal(LogLevel.Warning, canhBao.MucDo);
        Assert.Contains("InvalidOperationException", canhBao.NoiDung, StringComparison.Ordinal);
        var dapAn = await logDichVu.DocAsync();
        Assert.Contains("khong-hieu", dapAn.NoiDung, StringComparison.Ordinal);
        foreach (var ghi in new[] { canhBao, dapAn })
        {
            Assert.DoesNotContain("nộp hồ sơ", ghi.NoiDung, StringComparison.Ordinal);
            Assert.DoesNotContain("0912345678", ghi.NoiDung, StringComparison.Ordinal);
            Assert.DoesNotContain("09******78", ghi.NoiDung, StringComparison.Ordinal);
            Assert.Null(ghi.Loi);
        }
    }

    [Fact]
    public async Task Log_MoiDapAnChiCoLoaiVaThoiGian_KhongCoNoiDungCau()
    {
        var logDichVu = new BoGhiLog(typeof(TroLyService).FullName!);
        using var h = Dung(TroLyThu.Nen(), s => s.AddLogging(b => b.AddProvider(logDichVu)));

        await h.HoiAsync("khai sinh");

        var ghi = await logDichVu.DocAsync();
        Assert.Contains("thu-tuc-danh-sach", ghi.NoiDung, StringComparison.Ordinal);
        Assert.DoesNotContain("khai sinh", ghi.NoiDung, StringComparison.Ordinal);
    }

    // ---- Chủ đề gợi ý (BR-11) ----

    [Fact]
    public async Task ChuDe_ChanNuoi_DungLinhVucKhongLanNuoiConNuoi()
    {
        using var h = Dung(TroLyThu.Nen());
        var tep = TepDuLieuMau.Nhung;
        var chanNuoi = tep.ThuTuc.Where(t => t.LinhVucMa == "chan-nuoi").Select(t => t.Ma).ToList();
        var nuoiConNuoi = tep.ThuTuc.Where(t => t.LinhVucMa == "nuoi-con-nuoi").Select(t => t.Ma).ToList();

        var d = await h.Service.HoiChuDeAsync(4, null, Ct);

        Assert.Equal("chu-de", d!.Loai);
        Assert.Equal("Chăn nuôi", d.ChuDe!.TenHienThi);
        Assert.Equal(chanNuoi.Count, d.Tong);
        Assert.Equal(chanNuoi.Order(StringComparer.Ordinal), d.DanhSachThuTuc!.Select(t => t.Ma).Order(StringComparer.Ordinal));
        Assert.Empty(d.DanhSachThuTuc!.Select(t => t.Ma).Intersect(nuoiConNuoi));
    }

    [Fact]
    public async Task ChuDe_XayDung_GanLinhVucHoatDongXayDung()
    {
        using var h = Dung(TroLyThu.Nen());

        var d = await h.Service.HoiChuDeAsync(6, null, Ct);

        Assert.Equal("Xây dựng", d!.ChuDe!.TenHienThi);
        Assert.Equal("Hoạt động xây dựng", d.ChuDe.LinhVuc);
        Assert.All(d.DanhSachThuTuc!, t => Assert.Equal("Hoạt động xây dựng", t.LinhVuc));
        Assert.Equal(TepDuLieuMau.Nhung.ThuTuc.Count(t => t.LinhVucMa == "hoat-dong-xay-dung"), d.Tong);
    }

    [Fact]
    public async Task ChuDe_LinhVuc15ThuTuc_TongMuoiLamVoiMuoiPhanTu_MoiThuTucMotLan()
    {
        using var h = Dung(TroLyThu.CoChuDeThu());

        var d = await h.Service.HoiChuDeAsync(TroLyThu.ThuTuChuDe15, null, Ct);

        Assert.Equal(15, d!.Tong);
        Assert.Equal(10, d.DanhSachThuTuc!.Count);
        Assert.Equal(10, d.DanhSachThuTuc.Select(t => t.Ma).Distinct().Count());
        Assert.Equal(["TH.001", "TH.002", "TH.003"], d.DanhSachThuTuc.Take(3).Select(t => t.Ma));
        Assert.NotNull(d.TrungTam);
    }

    [Fact]
    public async Task ChuDe_LinhVucKhongCoThuTuc_TongKhongDanhSachRongKhongQuayKhongTrungTam()
    {
        using var h = Dung(TroLyThu.CoChuDeThu());

        var d = await h.Service.HoiChuDeAsync(TroLyThu.ThuTuChuDe0, null, Ct);

        Assert.Equal(0, d!.Tong);
        Assert.Empty(d.DanhSachThuTuc!);
        Assert.Null(d.Quay);
        Assert.Null(d.TrungTam);
    }

    [Fact]
    public async Task ChuDe_CoPhanCong_RaQuayVaNoiTiepNhanChuyen_NguCanhGiuHoacMotThuTuc()
    {
        using var h = Dung(TroLyThu.CoPhanCong());

        var d = await h.Service.HoiChuDeAsync(1, "1.001193", Ct);

        Assert.Equal(4, d!.Quay);
        Assert.Equal("Chi nhánh thử", d.NoiTiepNhanChuyen);
        Assert.Equal("1.001193", d.ThuTucDangNoi);
    }

    [Fact]
    public async Task ChuDe_KhongCoThuTu_TraNull_VaDanhSachChuDeTheoThuTu()
    {
        using var h = Dung(TroLyThu.Nen());

        Assert.Null(await h.Service.HoiChuDeAsync(7, null, Ct));
        Assert.Null(await h.Service.HoiChuDeAsync(0, null, Ct));
        var ds = await h.Service.LayChuDeAsync(Ct);

        Assert.Equal([1, 2, 3, 4, 5, 6], ds.Select(c => c.ThuTu));
        Assert.Equal("Đất đai", ds[0].TenHienThi);
        Assert.Equal("Xây dựng", ds[5].TenHienThi);
    }

    [Fact]
    public async Task ChuDe_NhapLaiChiConNamChuDe_KhungHienNam()
    {
        using var sau = Dung(TroLyThu.BotMotChuDe());

        Assert.Equal(5, (await sau.Service.LayChuDeAsync(Ct)).Count);
    }

    // ---- Cắt đáp án theo giới hạn từng mục (plan §4.6) ----

    [Fact]
    public async Task Cat_HoSoToiDaTamGiayToKemTong()
    {
        using var h = Dung(TroLyThu.CoThuTucDai());

        var nd = (await h.HoiAsync("DAI.001 cần giấy tờ gì")).NoiDung!;

        Assert.Equal(8, nd.ThanhPhanHoSo!.Count);
        Assert.Equal(12, nd.Tong);
        Assert.Null(nd.TrinhTu);
    }

    [Fact]
    public async Task Cat_TrinhTuHaiBuocMoiBuocToi500KyTuCoDauCat()
    {
        using var h = Dung(TroLyThu.CoThuTucDai());

        var nd = (await h.HoiAsync("DAI.001 các bước thực hiện")).NoiDung!;

        Assert.Equal(2, nd.TrinhTu!.Count);
        Assert.Equal(500, nd.TrinhTu[0].NoiDung.Length);
        Assert.EndsWith("…", nd.TrinhTu[0].NoiDung, StringComparison.Ordinal);
        Assert.Equal("Bước hai", nd.TrinhTu[1].NoiDung);
        Assert.Equal(4, nd.Tong);
    }

    [Fact]
    public async Task Cat_KetQuaSauVaCanCuSauBaiMuoiKyTuTrichYeu()
    {
        using var h = Dung(TroLyThu.CoThuTucDai());

        var ketQua = (await h.HoiAsync("DAI.001 kết quả nhận được gì")).NoiDung!;
        var canCu = (await h.HoiAsync("DAI.001 căn cứ pháp lý")).NoiDung!;

        Assert.Equal(6, ketQua.KetQua!.Count);
        Assert.Equal(9, ketQua.Tong);
        Assert.Equal(6, canCu.CanCu!.Count);
        Assert.Equal(9, canCu.Tong);
        Assert.Equal(200, canCu.CanCu[0].TrichYeu!.Length);
        Assert.EndsWith("…", canCu.CanCu[0].TrichYeu!, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Cat_KhongCatThiTongNull_ThoiHanPhiNoiNop()
    {
        using var h = Dung(TroLyThu.CoThuTucDai());

        var thoiHan = (await h.HoiAsync("DAI.001 mấy ngày")).NoiDung!;
        var phi = (await h.HoiAsync("DAI.001 phí bao nhiêu")).NoiDung!;
        var noiNop = await h.HoiAsync("DAI.001 nộp ở đâu");

        Assert.Equal("3 ngày làm việc", thoiHan.ThoiHan);
        Assert.Null(thoiHan.Tong);
        Assert.Equal("Lệ phí 10.000 đồng", phi.Phi);
        Assert.Equal(["Trực tuyến", "Trực tiếp"], noiNop.NoiDung!.HinhThucNop);
        Assert.NotNull(noiNop.TrungTam);
    }

    [Fact]
    public void Cat_ChuoiNganHonGioiHanGiuNguyen_CatKhongGiuaCapSurrogate()
    {
        Assert.Equal("abc", TraLoiThuTuc.Cat("abc", 5));
        var chuoi = new string('a', 497) + char.ConvertFromUtf32(0x1F600) + "xyz";

        var cat = TraLoiThuTuc.Cat(chuoi, 499);

        Assert.True(cat.Length <= 499);
        Assert.False(char.IsHighSurrogate(cat[^2]));
        Assert.EndsWith("…", cat, StringComparison.Ordinal);
    }
}
