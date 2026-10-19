using ClosedXML.Excel;
using DichVuCong.Data.Entities;
using DichVuCong.Import.Excel;
using DichVuCong.Import.KiemTra;
using DichVuCong.Import.Loai.ThuTuc;

namespace DichVuCong.Tests.Data.Import;

public class ThuTucTests
{
    private static readonly FileMau Mau = MauExcel.ThuTuc;

    private static XLWorkbook Sach() => XlTest.Mau(Mau);

    private static BangGhi Bang(XLWorkbook s, string sheet) => XlTest.Bang(s, Mau, sheet);

    private static void ThuTuc(
        XLWorkbook s,
        string ma = "1.001193",
        string? ten = "Thủ tục đăng ký khai sinh",
        string lv = "Hộ tịch",
        bool xa = true,
        bool tinh = true,
        string mucDo = "Toàn trình",
        string? thoiHan = null,
        string? yeuCau = null)
        => Bang(s, TenSheet.ThuTuc).Them(
            (TenCot.MaThuTuc, ma),
            (TenCot.TenThuTuc, ten),
            (TenCot.LinhVuc, lv),
            (TenCot.DanhMucXa, xa),
            (TenCot.DanhMucTinh, tinh),
            (TenCot.MucDo, mucDo),
            (TenCot.ThoiHanGiaiQuyet, thoiHan),
            (TenCot.YeuCauDieuKien, yeuCau),
            (TenCot.HinhThucNop, "Trực tuyến; Bưu chính; Trực tiếp"));

    private static KetQuaKiemTra<DuLieuThuTuc> KiemTra(XLWorkbook s) => KiemTraThuTuc.KiemTra(XlTest.Doc(s, Mau));

    private static (string Sheet, int? Dong)[] ViTri(KetQuaKiemTra<DuLieuThuTuc> kq) => [.. kq.Loi.Select(l => (l.Sheet, l.Dong))];

    [Fact]
    public void File_hop_le_ra_du_lieu_chuan_hoa()
    {
        var s = Sach();
        ThuTuc(s, yeuCau: "Không", thoiHan: "1 Khác");
        ThuTuc(s, ma: "2.000815", ten: "Chứng thực bản sao", lv: "Chứng thực", xa: false, mucDo: "Một phần");

        var kq = KiemTra(s);

        Assert.True(kq.HopLe);
        Assert.Equal(2, kq.DuLieu.ThuTuc.Count);
        Assert.Equal(2, kq.DuLieu.LinhVuc.Count);
        Assert.Equal(1, kq.DuLieu.CapXa);
        Assert.Equal(2, kq.DuLieu.CapTinh);
        var t = kq.DuLieu.ThuTuc[0];
        Assert.Equal("ho-tich", t.LinhVucMa);
        Assert.Equal("thu tuc dang ky khai sinh", t.TenTimKiem);
        Assert.Equal(MucDo.ToanTrinh, t.MucDo);
        Assert.Equal(MucDo.MotPhan, kq.DuLieu.ThuTuc[1].MucDo);
        Assert.Equal("Không", t.YeuCauDieuKien);
        Assert.Equal(["Trực tuyến", "Bưu chính", "Trực tiếp"], t.HinhThucNop);
        Assert.Equal([1, 2], kq.DuLieu.ThuTuc.Select(x => x.ThuTu));
    }

    [Fact]
    public void Ba_dong_loi_ra_dung_ba_loi_dung_so_dong_excel()
    {
        var s = Sach();
        ThuTuc(s);                                 // dòng 2: hợp lệ
        ThuTuc(s, ma: "1.000894", ten: null);      // dòng 3: thiếu tên
        ThuTuc(s, ma: "1.000656", mucDo: "Toàn phần"); // dòng 4: mức độ sai
        Bang(s, TenSheet.ThuongGap).Them((TenCot.MaThuTuc, "1.001193"), (TenCot.ThuTu, 1));
        Bang(s, TenSheet.ThuongGap).Them((TenCot.MaThuTuc, "9.999999"), (TenCot.ThuTu, 2)); // dòng 3: mã không có

        var kq = KiemTra(s);

        Assert.Equal(
            [(TenSheet.ThuTuc, 3), (TenSheet.ThuTuc, 4), (TenSheet.ThuongGap, 3)],
            ViTri(kq).Select(v => (v.Sheet, v.Dong!.Value)));
        Assert.Contains("thiếu Tên thủ tục", kq.Loi[0].LyDo, StringComparison.Ordinal);
        Assert.Contains("Toàn phần", kq.Loi[1].LyDo, StringComparison.Ordinal);
        Assert.Contains("9.999999 không có trong sheet Thủ tục", kq.Loi[2].LyDo, StringComparison.Ordinal);
    }

    [Fact]
    public void Ma_trung_bao_dong_gap_lan_dau()
    {
        var s = Sach();
        ThuTuc(s);
        ThuTuc(s);

        var loi = Assert.Single(KiemTra(s).Loi);

        Assert.Equal(3, loi.Dong);
        Assert.Contains("dòng 2", loi.LyDo, StringComparison.Ordinal);
    }

    [Fact]
    public void Khong_danh_dau_danh_muc_nao_la_loi()
    {
        var s = Sach();
        ThuTuc(s, xa: false, tinh: false);

        var loi = Assert.Single(KiemTra(s).Loi);

        Assert.Contains("danh mục", loi.LyDo, StringComparison.Ordinal);
    }

    [Fact]
    public void O_danh_dau_khac_x_la_loi()
    {
        var s = Sach();
        ThuTuc(s);
        XlTest.DatChu(s, Mau, TenSheet.ThuTuc, 2, TenCot.DanhMucXa, "có");

        var loi = Assert.Single(KiemTra(s).Loi);

        Assert.Contains("Danh mục cấp xã", loi.LyDo, StringComparison.Ordinal);
    }

    [Fact]
    public void Ten_linh_vuc_khong_co_chu_hay_so_la_loi()
    {
        var s = Sach();
        ThuTuc(s, lv: "– – –");

        var loi = Assert.Single(KiemTra(s).Loi);

        Assert.Contains("Lĩnh vực", loi.LyDo, StringComparison.Ordinal);
    }

    [Fact]
    public void Linh_vuc_khac_cach_viet_cung_ma_gop_lai_va_canh_bao()
    {
        var s = Sach();
        ThuTuc(s, ma: "1", lv: "Thủy lợi");
        ThuTuc(s, ma: "2", lv: "Thuỷ lợi");

        var kq = KiemTra(s);

        Assert.True(kq.HopLe);
        var lv = Assert.Single(kq.DuLieu.LinhVuc);
        Assert.Equal("Thủy lợi", lv.Ten);
        Assert.Equal("thuy-loi", lv.Ma);
        Assert.Single(kq.CanhBao);
        Assert.Equal(["thuy-loi", "thuy-loi"], kq.DuLieu.ThuTuc.Select(t => t.LinhVucMa));
    }

    [Theory]
    [InlineData("1 Khác", true)]
    [InlineData("Khác", true)]
    [InlineData("5 ngày làm việc", false)]
    public void Thoi_han_chi_ghi_Khac_canh_bao_nhung_van_nhap(string thoiHan, bool canhBao)
    {
        var s = Sach();
        ThuTuc(s, thoiHan: thoiHan);

        var kq = KiemTra(s);

        Assert.True(kq.HopLe);
        Assert.Equal(canhBao ? 1 : 0, kq.CanhBao.Count);
    }

    [Fact]
    public void Cot_uu_tien_la_cot_la()
    {
        var s = Sach();
        ThuTuc(s);
        s.Worksheet(TenSheet.ThuTuc).Cell(1, Mau[TenSheet.ThuTuc].Cot.Count + 1).Value = "Ưu tiên";

        var loi = Assert.Single(KiemTra(s).Loi);

        Assert.Null(loi.Dong);
        Assert.Equal(TenSheet.ThuTuc, loi.Sheet);
        Assert.Contains("Ưu tiên", loi.LyDo, StringComparison.Ordinal);
    }

    [Fact]
    public void Ma_o_kieu_so_la_dung_mot_loi_cho_thu_tuc_khong_co_dong_con()
    {
        var s = Sach();
        ThuTuc(s, ma: "x");
        XlTest.DatSo(s, Mau, TenSheet.ThuTuc, 2, TenCot.MaThuTuc, 1.01398);

        var loi = Assert.Single(KiemTra(s).Loi);

        Assert.Equal(2, loi.Dong);
        Assert.Contains("dạng chữ", loi.LyDo, StringComparison.Ordinal);
    }

    [Fact]
    public void U200E_trong_ten_bi_bo_va_ten_tim_kiem_khop_khong_dau()
    {
        var s = Sach();
        ThuTuc(s, ten: "Thủ tục đăng k" + XlTest.U200E + "ý khai sinh");

        var t = Assert.Single(KiemTra(s).DuLieu.ThuTuc);

        Assert.Equal("Thủ tục đăng ký khai sinh", t.Ten);
        Assert.DoesNotContain(XlTest.U200E, t.Ten);
        Assert.Contains("dang ky khai sinh", t.TenTimKiem, StringComparison.Ordinal);
    }

    // ----- Thường gặp (BR-15, AC-8) -----

    private static XLWorkbook Sach16()
    {
        var s = Sach();
        for (var i = 1; i <= 16; i++)
        {
            ThuTuc(s, ma: $"1.{i:000000}", ten: $"Thủ tục {i}");
        }

        for (var i = 1; i <= 16; i++)
        {
            Bang(s, TenSheet.ThuongGap).Them((TenCot.MaThuTuc, $"1.{i:000000}"), (TenCot.ThuTu, i));
        }

        return s;
    }

    [Fact]
    public void Thuong_gap_16_dong_ra_16_va_thu_tu_theo_cot_thu_tu()
    {
        var kq = KiemTra(Sach16());

        Assert.True(kq.HopLe);
        Assert.Equal(16, kq.DuLieu.ThuongGap);
        Assert.Equal(Enumerable.Range(1, 16), kq.DuLieu.ThuTuc.Select(t => t.ThuTuThuongGap!.Value));
    }

    [Fact]
    public void Doi_thu_tu_hai_dong_thi_thu_tu_luu_doi_theo()
    {
        var s = Sach16();
        XlTest.DatSo(s, Mau, TenSheet.ThuongGap, 2, TenCot.ThuTu, 2); // thủ tục 1 ↔ 2
        XlTest.DatSo(s, Mau, TenSheet.ThuongGap, 3, TenCot.ThuTu, 1);

        var kq = KiemTra(s);

        Assert.True(kq.HopLe);
        Assert.Equal(2, kq.DuLieu.ThuTuc.Single(t => t.Ma == "1.000001").ThuTuThuongGap);
        Assert.Equal(1, kq.DuLieu.ThuTuc.Single(t => t.Ma == "1.000002").ThuTuThuongGap);
    }

    [Fact]
    public void Bo_mot_dong_thi_con_15()
    {
        var s = Sach16();
        s.Worksheet(TenSheet.ThuongGap).Row(17).Delete();

        var kq = KiemTra(s);

        Assert.True(kq.HopLe);
        Assert.Equal(15, kq.DuLieu.ThuongGap);
    }

    [Fact]
    public void Thuong_gap_ma_khong_co_trong_sheet_thu_tuc_la_dung_mot_loi()
    {
        var s = Sach();
        ThuTuc(s);
        Bang(s, TenSheet.ThuongGap).Them((TenCot.MaThuTuc, "9.999999"), (TenCot.ThuTu, 1));

        var loi = Assert.Single(KiemTra(s).Loi);

        Assert.Equal((TenSheet.ThuongGap, 2), (loi.Sheet, loi.Dong!.Value));
    }

    [Fact]
    public void Thuong_gap_ma_trung_thu_tu_trung_thu_tu_khong_phai_so_nguyen_duong_la_loi()
    {
        var s = Sach();
        ThuTuc(s, ma: "1");
        ThuTuc(s, ma: "2");
        ThuTuc(s, ma: "3");
        Bang(s, TenSheet.ThuongGap).Them((TenCot.MaThuTuc, "1"), (TenCot.ThuTu, 1));
        Bang(s, TenSheet.ThuongGap).Them((TenCot.MaThuTuc, "1"), (TenCot.ThuTu, 2)); // mã trùng
        Bang(s, TenSheet.ThuongGap).Them((TenCot.MaThuTuc, "2"), (TenCot.ThuTu, 1));  // thứ tự trùng
        Bang(s, TenSheet.ThuongGap).Them((TenCot.MaThuTuc, "3"), (TenCot.ThuTu, "0")); // không dương

        var kq = KiemTra(s);

        Assert.Equal([3, 4, 5], kq.Loi.Select(l => l.Dong!.Value));
    }

    [Fact]
    public void Thuong_gap_thieu_ma_hoac_thu_tu_la_loi()
    {
        var s = Sach();
        ThuTuc(s);
        Bang(s, TenSheet.ThuongGap).Them((TenCot.ThuTu, 1));
        Bang(s, TenSheet.ThuongGap).Them((TenCot.MaThuTuc, "1.001193"));

        var kq = KiemTra(s);

        Assert.Equal(2, kq.Loi.Count);
    }

    // ----- Sheet con -----

    [Fact]
    public void Sheet_con_giu_thu_tu_dong_ke_ca_khi_cac_dong_khong_lien_nhau()
    {
        var s = Sach();
        ThuTuc(s, ma: "A");
        ThuTuc(s, ma: "B");
        Bang(s, TenSheet.TrinhTu).Them((TenCot.MaThuTuc, "A"), (TenCot.NoiDung, "A1"));
        Bang(s, TenSheet.TrinhTu).Them((TenCot.MaThuTuc, "B"), (TenCot.TruongHop, "Trực tiếp"), (TenCot.NoiDung, "B1"));
        Bang(s, TenSheet.TrinhTu).Them((TenCot.MaThuTuc, "A"), (TenCot.NoiDung, "A2"));
        Bang(s, TenSheet.KetQua).Them((TenCot.MaThuTuc, "A"), (TenCot.TenKetQua, "Giấy khai sinh"));
        Bang(s, TenSheet.KetQua).Them((TenCot.MaThuTuc, "A"), (TenCot.TenKetQua, "Trích lục"));

        var kq = KiemTra(s);

        Assert.True(kq.HopLe);
        var a = kq.DuLieu.ThuTuc.Single(t => t.Ma == "A");
        Assert.Equal(["A1", "A2"], a.TrinhTu.Select(b => b.NoiDung));
        Assert.Equal("Trực tiếp", kq.DuLieu.ThuTuc.Single(t => t.Ma == "B").TrinhTu.Single().TruongHop);
        Assert.Equal(["Giấy khai sinh", "Trích lục"], a.KetQua);
        Assert.Empty(kq.DuLieu.ThuTuc.Single(t => t.Ma == "B").KetQua);
    }

    [Fact]
    public void Sheet_con_loi_theo_tung_dong()
    {
        var s = Sach();
        ThuTuc(s, ma: "A");
        Bang(s, TenSheet.TrinhTu).Them((TenCot.MaThuTuc, "A"));                         // dòng 2: thiếu nội dung
        Bang(s, TenSheet.TrinhTu).Them((TenCot.MaThuTuc, "Z"), (TenCot.NoiDung, "x"));  // dòng 3: mã không có
        Bang(s, TenSheet.CachThuc).Them((TenCot.MaThuTuc, "A"));                        // dòng 2: không có giá trị nào
        Bang(s, TenSheet.CachThuc).Them((TenCot.MaThuTuc, "A"), (TenCot.MoTa, ""));     // dòng 3: không có giá trị nào
        Bang(s, TenSheet.CanCu).Them((TenCot.MaThuTuc, "A"));                           // dòng 2: không có giá trị
        Bang(s, TenSheet.ThanhPhanHoSo).Them((TenCot.MaThuTuc, "A"));                   // dòng 2: thiếu tên giấy tờ
        Bang(s, TenSheet.KetQua).Them((TenCot.MaThuTuc, "A"));                          // dòng 2: thiếu tên kết quả

        var kq = KiemTra(s);

        HashSet<(string, int)> mongDoi =
        [
            (TenSheet.TrinhTu, 2), (TenSheet.TrinhTu, 3), (TenSheet.CachThuc, 2), (TenSheet.CachThuc, 3),
            (TenSheet.ThanhPhanHoSo, 2), (TenSheet.KetQua, 2), (TenSheet.CanCu, 2),
        ];
        Assert.Equal(mongDoi.Count, kq.Loi.Count);
        Assert.True(mongDoi.SetEquals(kq.Loi.Select(l => (l.Sheet, l.Dong!.Value))));
    }

    [Theory]
    [InlineData(1, 0, 1, 0)]
    [InlineData(0, 0, null, null)]
    [InlineData(null, null, null, null)]
    [InlineData(0, null, null, null)]
    [InlineData(null, 0, null, null)]
    [InlineData(2, null, 2, null)]
    [InlineData(null, 3, null, 3)]
    public void So_ban_khong_co_so_nao_lon_hon_0_luu_nhu_chua_ghi(int? chinh, int? sao, int? luuChinh, int? luuSao)
    {
        var s = Sach();
        ThuTuc(s, ma: "A");
        var ws = s.Worksheet(TenSheet.ThanhPhanHoSo);
        Bang(s, TenSheet.ThanhPhanHoSo).Them((TenCot.MaThuTuc, "A"), (TenCot.TenGiayTo, "- Tờ khai theo mẫu"));
        if (chinh is not null)
        {
            ws.Cell(2, XlTest.SoCot(Mau, TenSheet.ThanhPhanHoSo, TenCot.SoBanChinh)).Value = chinh.Value;
        }

        if (sao is not null)
        {
            ws.Cell(2, XlTest.SoCot(Mau, TenSheet.ThanhPhanHoSo, TenCot.SoBanSao)).Value = sao.Value;
        }

        var kq = KiemTra(s);

        Assert.True(kq.HopLe);
        var giay = Assert.Single(kq.DuLieu.ThuTuc.Single().ThanhPhanHoSo);
        Assert.Equal("Tờ khai theo mẫu", giay.Ten);
        Assert.Equal(luuChinh, giay.BanChinh);
        Assert.Equal(luuSao, giay.BanSao);
    }

    [Fact]
    public void So_ban_ghi_chu_la_loi()
    {
        var s = Sach();
        ThuTuc(s, ma: "A");
        Bang(s, TenSheet.ThanhPhanHoSo).Them((TenCot.MaThuTuc, "A"), (TenCot.TenGiayTo, "x"), (TenCot.SoBanChinh, "một"));

        var loi = Assert.Single(KiemTra(s).Loi);

        Assert.Equal((TenSheet.ThanhPhanHoSo, 2), (loi.Sheet, loi.Dong!.Value));
        Assert.Contains("Số bản chính", loi.LyDo, StringComparison.Ordinal);
    }

    [Fact]
    public void Ten_giay_to_bat_dau_bang_gach_ngang_bi_bo_tien_to_va_khong_thanh_cong_thuc()
    {
        var s = Sach();
        ThuTuc(s, ma: "A");
        Bang(s, TenSheet.ThanhPhanHoSo).Them((TenCot.MaThuTuc, "A"), (TenCot.TenGiayTo, "- Tờ khai"), (TenCot.SoBanChinh, 1));
        Bang(s, TenSheet.ThanhPhanHoSo).Them((TenCot.MaThuTuc, "A"), (TenCot.TenGiayTo, "=1+1"));

        using var doc = XlTest.LuuRoiDoc(s);
        var kq = KiemTraThuTuc.KiemTra(XlTest.Doc(doc, Mau));

        Assert.True(kq.HopLe);
        Assert.Equal(["Tờ khai", "=1+1"], kq.DuLieu.ThuTuc.Single().ThanhPhanHoSo.Select(g => g.Ten));
    }

    [Fact]
    public void Tien_to_danh_sach_bi_bo_o_ten_giay_to_ket_qua_va_buoc_trinh_tu()
    {
        var s = Sach();
        ThuTuc(s, ma: "A");
        Bang(s, TenSheet.TrinhTu).Them((TenCot.MaThuTuc, "A"), (TenCot.NoiDung, "- Nộp hồ sơ"));
        Bang(s, TenSheet.TrinhTu).Them((TenCot.MaThuTuc, "A"), (TenCot.NoiDung, "• Nhận kết quả"));
        Bang(s, TenSheet.ThanhPhanHoSo).Them((TenCot.MaThuTuc, "A"), (TenCot.TenGiayTo, "+ Tờ khai theo mẫu"));
        Bang(s, TenSheet.ThanhPhanHoSo).Them((TenCot.MaThuTuc, "A"), (TenCot.TenGiayTo, "  -   Bản sao CCCD"));
        Bang(s, TenSheet.KetQua).Them((TenCot.MaThuTuc, "A"), (TenCot.TenKetQua, "- Giấy chứng nhận"));

        using var doc = XlTest.LuuRoiDoc(s);
        var kq = KiemTraThuTuc.KiemTra(XlTest.Doc(doc, Mau));

        Assert.True(kq.HopLe);
        var a = kq.DuLieu.ThuTuc.Single();
        Assert.Equal(["Nộp hồ sơ", "Nhận kết quả"], a.TrinhTu.Select(b => b.NoiDung));
        Assert.Equal(["Tờ khai theo mẫu", "Bản sao CCCD"], a.ThanhPhanHoSo.Select(g => g.Ten));
        Assert.Equal(["Giấy chứng nhận"], a.KetQua);
    }

    [Fact]
    public void Sheet_thu_tuc_loi_cau_truc_thi_khong_bao_loi_keo_theo_o_sheet_khac()
    {
        var s = Sach();
        s.Worksheet(TenSheet.ThuTuc).Column(2).Delete();
        Bang(s, TenSheet.ThuongGap).Them((TenCot.MaThuTuc, "1"), (TenCot.ThuTu, 1));

        var loi = Assert.Single(KiemTra(s).Loi);

        Assert.Equal(TenSheet.ThuTuc, loi.Sheet);
        Assert.Null(loi.Dong);
    }

    [Fact]
    public void Can_cu_chi_can_mot_trong_hai_cot()
    {
        var s = Sach();
        ThuTuc(s, ma: "A");
        Bang(s, TenSheet.CanCu).Them((TenCot.MaThuTuc, "A"), (TenCot.SoKyHieu, "85/2019/TT-BTC"));
        Bang(s, TenSheet.CanCu).Them((TenCot.MaThuTuc, "A"), (TenCot.TrichYeu, "Thông tư"));

        var kq = KiemTra(s);

        Assert.True(kq.HopLe);
        Assert.Equal(2, kq.DuLieu.ThuTuc.Single().CanCu.Count);
    }
}
