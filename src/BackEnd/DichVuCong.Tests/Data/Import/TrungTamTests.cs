using ClosedXML.Excel;
using DichVuCong.Import.Excel;
using DichVuCong.Import.KiemTra;
using DichVuCong.Import.Loai.TrungTam;

namespace DichVuCong.Tests.Data.Import;

public class TrungTamTests
{
    private static readonly FileMau Mau = MauExcel.TrungTam;

    private static readonly (string Muc, string GiaTri)[] NamMucBatBuoc =
    [
        (MauExcel.MucTenDonVi, "Trung tâm Phục vụ hành chính công xã Cần Giuộc"),
        (MauExcel.MucNguoiChiuTrachNhiem, "Nguyễn Văn Thử"),
        (MauExcel.MucDiaChi, "Quốc lộ 50, xã Cần Giuộc"),
        (MauExcel.MucDienThoai, "02723 893 900"),
        (MauExcel.MucEmail, "cangiuoc@tayninh.gov.vn"),
    ];

    /// <summary>File hợp lệ tối thiểu; <paramref name="sua"/> chỉnh thêm rồi mới kiểm.</summary>
    private static KetQuaKiemTra<DuLieuTrungTam> KiemTra(
        Action<XLWorkbook>? sua = null,
        string? bo = null,
        bool coLienKetCongDvc = true)
    {
        using var s = XlTest.Mau(Mau);
        var tt = XlTest.Bang(s, Mau, TenSheet.TrungTam);
        foreach (var (muc, giaTri) in NamMucBatBuoc.Where(m => m.Muc != bo))
        {
            tt.Them((TenCot.Muc, muc), (TenCot.GiaTri, giaTri));
        }

        var gio = XlTest.Bang(s, Mau, TenSheet.GioLamViec);
        foreach (var thu in MauExcel.TenThu.Take(5))
        {
            gio.Them((TenCot.Thu, thu), (TenCot.SangTu, "07:00"), (TenCot.SangDen, "11:30"), (TenCot.ChieuTu, "13:30"), (TenCot.ChieuDen, "17:00"));
        }

        gio.Them((TenCot.Thu, "Thứ Bảy"));
        gio.Them((TenCot.Thu, "Chủ nhật"));

        if (coLienKetCongDvc)
        {
            XlTest.Bang(s, Mau, TenSheet.LienKet).Them((TenCot.Ten, "Cổng Dịch vụ công Quốc gia"), (TenCot.DiaChiWeb, "https://dichvucong.gov.vn"));
        }

        sua?.Invoke(s);
        return KiemTraTrungTam.KiemTra(XlTest.Doc(s, Mau));
    }

    [Fact]
    public void File_hop_le_luu_5_ngay_lam_viec_va_cac_muc()
    {
        var kq = KiemTra();

        Assert.True(kq.HopLe);
        Assert.Empty(kq.CanhBao);
        Assert.Equal("Nguyễn Văn Thử", kq.DuLieu.TrungTam.NguoiChiuTrachNhiem);
        Assert.Equal("02723 893 900", kq.DuLieu.TrungTam.DienThoai);
        Assert.Equal(5, kq.DuLieu.GioLamViec.Count);
        Assert.Equal([1, 2, 3, 4, 5], kq.DuLieu.GioLamViec.Select(g => (int)g.Thu));
        Assert.Equal(new TimeOnly(7, 0), kq.DuLieu.GioLamViec[0].SangTu);
        Assert.Null(kq.DuLieu.TrungTam.BanDo);
    }

    [Theory]
    [InlineData(MauExcel.MucTenDonVi)]
    [InlineData(MauExcel.MucNguoiChiuTrachNhiem)]
    [InlineData(MauExcel.MucDiaChi)]
    [InlineData(MauExcel.MucDienThoai)]
    [InlineData(MauExcel.MucEmail)]
    public void Thieu_tung_muc_bat_buoc_bao_dung_ten_muc(string muc)
    {
        var kq = KiemTra(bo: muc);

        var loi = Assert.Single(kq.Loi);
        Assert.Equal(TenSheet.TrungTam, loi.Sheet);
        Assert.Contains($"\"{muc}\"", loi.LyDo, StringComparison.Ordinal);
    }

    [Fact]
    public void Muc_bat_buoc_co_dong_nhung_gia_tri_trong_van_la_thieu()
    {
        var kq = KiemTra(
            sua: s => XlTest.Bang(s, Mau, TenSheet.TrungTam).Them((TenCot.Muc, MauExcel.MucBanDo)),
            bo: MauExcel.MucEmail);

        var loi = Assert.Single(kq.Loi);
        Assert.Contains("Email", loi.LyDo, StringComparison.Ordinal);
    }

    [Fact]
    public void Muc_la_va_muc_trung_la_loi()
    {
        var kq = KiemTra(s =>
        {
            var b = XlTest.Bang(s, Mau, TenSheet.TrungTam);
            b.Them((TenCot.Muc, "Màu sắc"), (TenCot.GiaTri, "đỏ"));
            b.Them((TenCot.Muc, MauExcel.MucEmail), (TenCot.GiaTri, "b@c.vn"));
        });

        Assert.Equal(2, kq.Loi.Count);
        Assert.All(kq.Loi, l => Assert.NotNull(l.Dong));
    }

    [Fact]
    public void Email_dien_thoai_sai_dang_la_loi_dong()
    {
        var kq = KiemTra(s =>
        {
            var b = XlTest.Bang(s, Mau, TenSheet.TrungTam);
            b.Them((TenCot.Muc, MauExcel.MucXa), (TenCot.GiaTri, "xã Cần Giuộc"));
            XlTest.DatChu(s, Mau, TenSheet.TrungTam, 6, TenCot.GiaTri, "khong-phai-email");
            XlTest.DatChu(s, Mau, TenSheet.TrungTam, 5, TenCot.GiaTri, "abc");
        });

        Assert.Equal([5, 6], kq.Loi.Select(l => l.Dong!.Value));
    }

    [Fact]
    public void Dien_thoai_o_kieu_so_la_loi_nhap_dang_chu()
    {
        var kq = KiemTra(s => XlTest.DatSo(s, Mau, TenSheet.TrungTam, 5, TenCot.GiaTri, 2723893900));

        var loi = Assert.Single(kq.Loi);
        Assert.Equal(5, loi.Dong);
        Assert.Contains("dạng chữ", loi.LyDo, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("javascript:alert(1)")]
    [InlineData("data:text/html,<script>alert(1)</script>")]
    [InlineData("/duong/tuong/doi")]
    public void Dia_chi_web_nguy_hiem_bi_chan_o_moi_cho(string url)
    {
        var kq = KiemTra(s =>
        {
            XlTest.Bang(s, Mau, TenSheet.TrungTam).Them((TenCot.Muc, MauExcel.MucBanDo), (TenCot.GiaTri, url));
            XlTest.Bang(s, Mau, TenSheet.TrungTam).Them((TenCot.Muc, MauExcel.MucFacebook), (TenCot.GiaTri, url));
            XlTest.Bang(s, Mau, TenSheet.LienKet).Them((TenCot.Ten, "Xấu"), (TenCot.DiaChiWeb, url));
            XlTest.Bang(s, Mau, TenSheet.ODichVu).Them((TenCot.Ten, "Xấu"), (TenCot.DiaChiWeb, url));
        });

        Assert.Equal(
            [(TenSheet.TrungTam, 7), (TenSheet.TrungTam, 8), (TenSheet.LienKet, 3), (TenSheet.ODichVu, 2)],
            kq.Loi.Select(l => (l.Sheet, l.Dong!.Value)));
    }

    [Fact]
    public void O_dich_vu_trong_link_nhap_duoc_url_null_bieu_tuong_mac_dinh_lien_ket()
    {
        var kq = KiemTra(s =>
        {
            var b = XlTest.Bang(s, Mau, TenSheet.ODichVu);
            b.Them((TenCot.Ten, "Đánh giá hài lòng"), (TenCot.BieuTuong, "danh-gia"));
            b.Them((TenCot.Ten, "Tra cứu hồ sơ"), (TenCot.BieuTuong, "TRA-CUU-HO-SO"), (TenCot.DiaChiWeb, "https://dichvucong.gov.vn/tra-cuu-ho-so"));
            b.Them((TenCot.Ten, "Khác"));
        });

        Assert.True(kq.HopLe);
        Assert.Equal(["Đánh giá hài lòng", "Tra cứu hồ sơ", "Khác"], kq.DuLieu.ODichVu.Select(o => o.Ten));
        Assert.Null(kq.DuLieu.ODichVu[0].Url);
        Assert.Equal("tra-cuu-ho-so", kq.DuLieu.ODichVu[1].BieuTuong);
        Assert.Equal("lien-ket", kq.DuLieu.ODichVu[2].BieuTuong);
        Assert.Equal([1, 2, 3], kq.DuLieu.ODichVu.Select(o => o.ThuTu));
    }

    [Fact]
    public void Bieu_tuong_mot_cua_khong_con_trong_danh_sach()
    {
        var kq = KiemTra(s => XlTest.Bang(s, Mau, TenSheet.ODichVu).Them((TenCot.Ten, "Một cửa"), (TenCot.BieuTuong, "mot-cua")));

        var loi = Assert.Single(kq.Loi);
        Assert.Contains("mot-cua", loi.LyDo, StringComparison.Ordinal);
    }

    [Fact]
    public void Thu_hai_sang_tu_1130_den_0700_la_dung_mot_loi()
    {
        var kq = KiemTra(s =>
        {
            XlTest.DatChu(s, Mau, TenSheet.GioLamViec, 2, TenCot.SangTu, "11:30");
            XlTest.DatChu(s, Mau, TenSheet.GioLamViec, 2, TenCot.SangDen, "07:00");
        });

        var loi = Assert.Single(kq.Loi);
        Assert.Equal((TenSheet.GioLamViec, 2), (loi.Sheet, loi.Dong!.Value));
    }

    [Fact]
    public void Gio_thieu_mot_nua_cap_thu_trung_thu_khong_hop_le_la_loi()
    {
        var kq = KiemTra(s =>
        {
            var b = XlTest.Bang(s, Mau, TenSheet.GioLamViec);
            b.Them((TenCot.Thu, "Thứ Hai"), (TenCot.SangTu, "07:00"));                         // dòng 9: trùng thứ + thiếu giờ đến
            b.Them((TenCot.Thu, "Thứ Chín"), (TenCot.SangTu, "07:00"), (TenCot.SangDen, "11:00")); // dòng 10: thứ sai
            b.Them((TenCot.Thu, "Thứ Bảy"), (TenCot.SangTu, "7h"), (TenCot.SangDen, "11:00"));  // dòng 11: trùng thứ + sai dạng
        });

        Assert.Equal([9, 10, 11], kq.Loi.Select(l => l.Dong!.Value));
        Assert.Equal(2, kq.Loi.First(l => l.Dong == 9).LyDo.Split("; ").Length);
        Assert.Contains("HH:mm", kq.Loi.First(l => l.Dong == 11).LyDo, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("Thứ 2", 1)]
    [InlineData("thu hai", 1)]
    [InlineData("CN", 7)]
    [InlineData("Chủ nhật", 7)]
    [InlineData("Thứ 7", 6)]
    public void Ten_thu_chap_nhan_cac_dang(string ten, int thu)
    {
        var kq = KiemTra(
            s =>
            {
                s.Worksheet(TenSheet.GioLamViec).Clear();
                s.Worksheet(TenSheet.GioLamViec).Cell(1, 1).Value = TenCot.Thu;
                s.Worksheet(TenSheet.GioLamViec).Cell(1, 2).Value = TenCot.SangTu;
                s.Worksheet(TenSheet.GioLamViec).Cell(1, 3).Value = TenCot.SangDen;
                s.Worksheet(TenSheet.GioLamViec).Cell(1, 4).Value = TenCot.ChieuTu;
                s.Worksheet(TenSheet.GioLamViec).Cell(1, 5).Value = TenCot.ChieuDen;
                XlTest.Bang(s, Mau, TenSheet.GioLamViec).Them((TenCot.Thu, ten), (TenCot.SangTu, "08:00"), (TenCot.SangDen, "09:00"));
            });

        Assert.True(kq.HopLe);
        Assert.Equal(thu, kq.DuLieu.GioLamViec.Single().Thu);
    }

    [Fact]
    public void Thieu_lien_ket_cong_dvc_quoc_gia_canh_bao_nhung_van_nhap()
    {
        var kq = KiemTra(coLienKetCongDvc: false);

        Assert.True(kq.HopLe);
        Assert.Single(kq.CanhBao);
    }

    [Fact]
    public void Lien_ket_thieu_ten_hoac_link_la_loi()
    {
        var kq = KiemTra(s =>
        {
            XlTest.Bang(s, Mau, TenSheet.LienKet).Them((TenCot.Ten, "Chỉ có tên"));
            XlTest.Bang(s, Mau, TenSheet.LienKet).Them((TenCot.DiaChiWeb, "https://x.vn"));
        });

        Assert.Equal([3, 4], kq.Loi.Select(l => l.Dong!.Value));
    }
}
