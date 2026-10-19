using ClosedXML.Excel;
using DichVuCong.Data.Entities;
using DichVuCong.Import.Excel;
using DichVuCong.Import.KiemTra;
using DichVuCong.Import.Loai.TroLy;

namespace DichVuCong.Tests.Data.Import;

public class TroLyTests
{
    private static readonly FileMau Mau = MauExcel.TroLy;

    private static readonly HashSet<string> MaCo = ["1.012784", "1.001193"];

    private static KetQuaKiemTra<DuLieuTroLy> KiemTra(Action<XLWorkbook> dat, ISet<string>? maThuTuc = null, ISet<string>? maLinhVuc = null)
    {
        using var s = XlTest.Mau(Mau);
        dat(s);
        return KiemTraTroLy.KiemTra(XlTest.Doc(s, Mau), maThuTuc ?? MaCo, maLinhVuc);
    }

    private static BangGhi Cau(XLWorkbook s) => XlTest.Bang(s, Mau, TenSheet.CauHoiMau);

    [Fact]
    public void Cau_co_tra_loi_va_cau_theo_muc_deu_nhap_duoc_cach_hoi_ThuTu_1_la_cau_chinh()
    {
        var kq = KiemTra(s =>
        {
            Cau(s).Them(
                (TenCot.CauHoi, "Điều kiện tách thửa đất là gì?"),
                (TenCot.CachHoiKhac, "điều kiện tách thửa; tách thửa cần điều kiện gì"),
                (TenCot.CauTraLoi, "Theo Quyết định 139/2026/QĐ-UBND…\nDòng 2"),
                (TenCot.MaThuTucLienQuan, "1.012784"));
            Cau(s).Them(
                (TenCot.CauHoi, "Trung tâm ở đâu?"),
                (TenCot.CachHoiKhac, "địa chỉ trung tâm"),
                (TenCot.MucThongTinTrungTam, "Địa chỉ"));
        });

        Assert.True(kq.HopLe);
        Assert.Equal(2, kq.DuLieu.CauHoiMau.Count);
        Assert.Equal(1, kq.DuLieu.CauTheoMuc);

        var a = kq.DuLieu.CauHoiMau[0];
        Assert.Equal("Theo Quyết định 139/2026/QĐ-UBND…\nDòng 2", a.TraLoi);
        Assert.Null(a.MucTrungTam);
        Assert.Equal(["1.012784"], a.MaThuTuc);
        Assert.Equal(
            [(1, "Điều kiện tách thửa đất là gì?"), (2, "điều kiện tách thửa"), (3, "tách thửa cần điều kiện gì")],
            a.CachHoi.Select(c => (c.ThuTu, c.NoiDung)));
        Assert.Equal("dieu kien tach thua dat la gi?", a.CachHoi[0].NoiDungTimKiem);

        var b = kq.DuLieu.CauHoiMau[1];
        Assert.Null(b.TraLoi);
        Assert.Equal(MucTrungTam.DiaChi, b.MucTrungTam);
        Assert.Equal([1, 2], kq.DuLieu.CauHoiMau.Select(c => c.ThuTu));
    }

    [Theory]
    [InlineData("Địa chỉ", MucTrungTam.DiaChi)]
    [InlineData("giờ làm việc", MucTrungTam.GioLamViec)]
    [InlineData("Điện thoại", MucTrungTam.DienThoai)]
    [InlineData("EMAIL", MucTrungTam.Email)]
    [InlineData("Nộp trực tuyến", MucTrungTam.NopTrucTuyen)]
    public void Nam_muc_thong_tin_trung_tam_anh_xa_dung_enum(string muc, MucTrungTam mongDoi)
    {
        var kq = KiemTra(s => Cau(s).Them((TenCot.CauHoi, "Hỏi?"), (TenCot.MucThongTinTrungTam, muc)));

        Assert.True(kq.HopLe);
        Assert.Equal(mongDoi, kq.DuLieu.CauHoiMau.Single().MucTrungTam);
    }

    [Fact]
    public void Co_ca_hai_hoac_khong_co_ca_hai_la_hai_dong_loi()
    {
        var kq = KiemTra(s =>
        {
            Cau(s).Them((TenCot.CauHoi, "Hợp lệ?"), (TenCot.MucThongTinTrungTam, "Địa chỉ"));                       // dòng 2
            Cau(s).Them((TenCot.CauHoi, "Cả hai?"), (TenCot.CauTraLoi, "x"), (TenCot.MucThongTinTrungTam, "Email")); // dòng 3
            Cau(s).Them((TenCot.CauHoi, "Không có?"));                                                              // dòng 4
        });

        Assert.Equal([3, 4], kq.Loi.Select(l => l.Dong!.Value));
        Assert.All(kq.Loi, l => Assert.Contains("đúng một", l.LyDo, StringComparison.Ordinal));
    }

    [Fact]
    public void Muc_ngoai_5_lua_chon_la_mot_loi_ve_muc()
    {
        var kq = KiemTra(s => Cau(s).Them((TenCot.CauHoi, "Hỏi?"), (TenCot.MucThongTinTrungTam, "Bản đồ")));

        var loi = Assert.Single(kq.Loi);
        Assert.Contains("Mục thông tin Trung tâm", loi.LyDo, StringComparison.Ordinal);
    }

    [Fact]
    public void Cau_hoi_trung_sau_chuan_hoa_la_loi()
    {
        var kq = KiemTra(s =>
        {
            Cau(s).Them((TenCot.CauHoi, "Khai sinh ở đâu"), (TenCot.CauTraLoi, "a"));
            Cau(s).Them((TenCot.CauHoi, "  KHAI  SINH Ở ĐÂU "), (TenCot.CauTraLoi, "b"));
        });

        var loi = Assert.Single(kq.Loi);
        Assert.Equal(3, loi.Dong);
    }

    [Fact]
    public void Ma_thu_tuc_lien_quan_khong_co_trong_danh_muc_la_loi()
    {
        var kq = KiemTra(s => Cau(s).Them((TenCot.CauHoi, "Hỏi?"), (TenCot.CauTraLoi, "a"), (TenCot.MaThuTucLienQuan, "1.012784; 9.999999")));

        var loi = Assert.Single(kq.Loi);
        Assert.Contains("9.999999", loi.LyDo, StringComparison.Ordinal);
    }

    [Fact]
    public void Khong_co_danh_muc_de_doi_chieu_thi_bo_qua_kiem_ma()
    {
        using var s = XlTest.Mau(Mau);
        Cau(s).Them((TenCot.CauHoi, "Hỏi?"), (TenCot.CauTraLoi, "a"), (TenCot.MaThuTucLienQuan, "9.999999"));

        var kq = KiemTraTroLy.KiemTra(XlTest.Doc(s, Mau), null, null);

        Assert.True(kq.HopLe);
    }

    [Fact]
    public void Cach_hoi_qua_500_ky_tu_la_loi()
    {
        var kq = KiemTra(s => Cau(s).Them((TenCot.CauHoi, "Hỏi?"), (TenCot.CauTraLoi, "a"), (TenCot.CachHoiKhac, "ngắn; " + new string('x', 501))));

        Assert.Single(kq.Loi);
    }

    [Fact]
    public void Cau_hoi_qua_500_ky_tu_la_loi()
    {
        var kq = KiemTra(s => Cau(s).Them((TenCot.CauHoi, new string('x', 501)), (TenCot.CauTraLoi, "a")));

        Assert.Single(kq.Loi);
    }

    [Fact]
    public void Ma_thu_tuc_lien_quan_o_kieu_so_la_loi()
    {
        var kq = KiemTra(s =>
        {
            Cau(s).Them((TenCot.CauHoi, "Hỏi?"), (TenCot.CauTraLoi, "a"));
            XlTest.DatSo(s, Mau, TenSheet.CauHoiMau, 2, TenCot.MaThuTucLienQuan, 1.012784);
        });

        Assert.Single(kq.Loi);
    }

    // ----- Chủ đề gợi ý -----

    [Fact]
    public void Sau_chu_de_giu_dung_thu_tu_va_ma_linh_vuc()
    {
        (string, string)[] chuDe =
        [
            ("Đất đai", "Đất đai"), ("Hộ tịch", "Hộ tịch"), ("Bảo trợ XH", "Bảo trợ xã hội"),
            ("Chăn nuôi", "Chăn nuôi"), ("Trẻ em", "Trẻ em"), ("Xây dựng", "Hoạt động xây dựng"),
        ];
        var kq = KiemTra(s =>
        {
            var b = XlTest.Bang(s, Mau, TenSheet.ChuDeGoiY);
            foreach (var (ten, lv) in chuDe)
            {
                b.Them((TenCot.TenHienThi, ten), (TenCot.LinhVuc, lv));
            }
        });

        Assert.True(kq.HopLe);
        Assert.Equal(chuDe.Select(c => c.Item1), kq.DuLieu.ChuDeGoiY.Select(c => c.TenHienThi));
        Assert.Equal([1, 2, 3, 4, 5, 6], kq.DuLieu.ChuDeGoiY.Select(c => c.ThuTu));
        Assert.Equal("bao-tro-xa-hoi", kq.DuLieu.ChuDeGoiY[2].LinhVucMa);
        Assert.Equal("Bảo trợ xã hội", kq.DuLieu.ChuDeGoiY[2].TenLinhVuc);
        Assert.Equal("hoat-dong-xay-dung", kq.DuLieu.ChuDeGoiY[5].LinhVucMa);
    }

    [Fact]
    public void Chu_de_trong_ten_linh_vuc_hoac_chi_co_dau_la_loi_dung_dong_do()
    {
        var kq = KiemTra(s =>
        {
            var b = XlTest.Bang(s, Mau, TenSheet.ChuDeGoiY);
            b.Them((TenCot.TenHienThi, "Đất đai"), (TenCot.LinhVuc, "Đất đai"));
            b.Them((TenCot.TenHienThi, "Hộ tịch"));
            b.Them((TenCot.TenHienThi, "Trẻ em"), (TenCot.LinhVuc, "– – –"));
            b.Them((TenCot.LinhVuc, "Chăn nuôi"));
        });

        Assert.Equal([3, 4, 5], kq.Loi.Select(l => l.Dong!.Value));
        Assert.DoesNotContain(kq.DuLieu.ChuDeGoiY, c => c.TenHienThi != "Đất đai");
    }

    [Fact]
    public void Ten_hien_thi_qua_50_ky_tu_la_loi()
    {
        var kq = KiemTra(s => XlTest.Bang(s, Mau, TenSheet.ChuDeGoiY).Them((TenCot.TenHienThi, new string('x', 51)), (TenCot.LinhVuc, "Đất đai")));

        Assert.Single(kq.Loi);
    }

    [Fact]
    public void Chu_de_linh_vuc_khong_co_trong_danh_muc_canh_bao_nhung_van_nhap()
    {
        var kq = KiemTra(
            s => XlTest.Bang(s, Mau, TenSheet.ChuDeGoiY).Them((TenCot.TenHienThi, "Xây dựng"), (TenCot.LinhVuc, "Hoạt động xây dựng")),
            maLinhVuc: new HashSet<string> { "dat-dai" });

        Assert.True(kq.HopLe);
        Assert.Single(kq.CanhBao);
        Assert.Single(kq.DuLieu.ChuDeGoiY);
    }

    // ----- Từ đồng nghĩa, viết tắt -----

    [Fact]
    public void Tu_dong_nghia_va_viet_tat_hop_le()
    {
        var kq = KiemTra(s =>
        {
            XlTest.Bang(s, Mau, TenSheet.TuDongNghia).Them((TenCot.Tu, "ket hon"), (TenCot.CachNoiKhac, "cuoi vo; lay chong"));
            XlTest.Bang(s, Mau, TenSheet.VietTat).Them((TenCot.VietTat, "TTHC"), (TenCot.DayDu, "thủ tục hành chính"));
            XlTest.Bang(s, Mau, TenSheet.VietTat).Them((TenCot.VietTat, "đk"), (TenCot.DayDu, "đăng ký"));
        });

        Assert.True(kq.HopLe);
        Assert.Equal(["cuoi vo", "lay chong"], kq.DuLieu.TuDongNghia.Single().CachNoiKhac);
        Assert.Equal(["tthc", "dk"], kq.DuLieu.VietTat.Select(v => v.ChuVietTatTimKiem));
    }

    [Fact]
    public void Viet_tat_dk_va_DK_la_loi_trung()
    {
        var kq = KiemTra(s =>
        {
            XlTest.Bang(s, Mau, TenSheet.VietTat).Them((TenCot.VietTat, "đk"), (TenCot.DayDu, "đăng ký"));
            XlTest.Bang(s, Mau, TenSheet.VietTat).Them((TenCot.VietTat, "ĐK"), (TenCot.DayDu, "điều kiện"));
        });

        var loi = Assert.Single(kq.Loi);
        Assert.Equal((TenSheet.VietTat, 3), (loi.Sheet, loi.Dong!.Value));
    }

    [Fact]
    public void Tu_dong_nghia_trung_va_thieu_cach_noi_khac_la_loi()
    {
        var kq = KiemTra(s =>
        {
            var b = XlTest.Bang(s, Mau, TenSheet.TuDongNghia);
            b.Them((TenCot.Tu, "Khai sinh"), (TenCot.CachNoiKhac, "giay khai sinh"));
            b.Them((TenCot.Tu, "khai  sinh"), (TenCot.CachNoiKhac, "x"));
            b.Them((TenCot.Tu, "ly hon"));
            b.Them((TenCot.CachNoiKhac, "chia tay"));
        });

        Assert.Equal([3, 4, 5], kq.Loi.Select(l => l.Dong!.Value));
    }

    [Fact]
    public void Viet_tat_thieu_mot_trong_hai_cot_la_loi()
    {
        var kq = KiemTra(s =>
        {
            XlTest.Bang(s, Mau, TenSheet.VietTat).Them((TenCot.VietTat, "CCCD"));
            XlTest.Bang(s, Mau, TenSheet.VietTat).Them((TenCot.DayDu, "căn cước công dân"));
        });

        Assert.Equal(2, kq.Loi.Count);
    }
}
