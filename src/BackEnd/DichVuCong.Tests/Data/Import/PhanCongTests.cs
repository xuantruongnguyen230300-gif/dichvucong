using DichVuCong.Import.Excel;
using DichVuCong.Import.Loai.PhanCong;

namespace DichVuCong.Tests.Data.Import;

public class PhanCongTests
{
    private static readonly FileMau Mau = MauExcel.PhanCong;

    private static KetQuaPhanCong KiemTra(Action<ClosedXML.Excel.XLWorkbook> dat, ISet<string>? danhMuc = null)
    {
        using var s = XlTest.Mau(Mau);
        dat(s);
        var kq = KiemTraPhanCong.KiemTra(XlTest.Doc(s, Mau), danhMuc);
        return new KetQuaPhanCong(kq.DuLieu, [.. kq.Loi], [.. kq.CanhBao]);
    }

    private sealed record KetQuaPhanCong(
        DuLieuPhanCong DuLieu,
        IReadOnlyList<DichVuCong.Import.KiemTra.LoiDong> Loi,
        IReadOnlyList<DichVuCong.Import.KiemTra.CanhBao> CanhBao);

    [Fact]
    public void Hai_sheet_chi_co_tieu_de_hop_le_ra_0_phan_cong_0_nhan_su()
    {
        var kq = KiemTra(_ => { });

        Assert.Empty(kq.Loi);
        Assert.Empty(kq.DuLieu.PhanCong);
        Assert.Empty(kq.DuLieu.NhanSu);
    }

    [Fact]
    public void Quay_trong_duoc_nhan_va_ma_linh_vuc_sinh_tu_ten()
    {
        var kq = KiemTra(s =>
        {
            var b = XlTest.Bang(s, Mau, TenSheet.PhanCong);
            b.Them((TenCot.LinhVuc, "Hộ tịch"), (TenCot.Quay, 3));
            b.Them((TenCot.LinhVuc, "Đăng ký, quản lý cư trú"), (TenCot.NoiTiepNhanChuyen, "Công an"));
            b.Them((TenCot.LinhVuc, "Chưa phân loại"));
        });

        Assert.Empty(kq.Loi);
        Assert.Equal(["ho-tich", "dang-ky-quan-ly-cu-tru", "chua-phan-loai"], kq.DuLieu.PhanCong.Select(p => p.LinhVucMa));
        Assert.Equal([3, null, null], kq.DuLieu.PhanCong.Select(p => p.Quay));
        Assert.Equal("Hộ tịch", kq.DuLieu.PhanCong[0].TenLinhVuc);
        Assert.Equal("Công an", kq.DuLieu.PhanCong[1].NoiTiepNhanChuyen);
    }

    [Fact]
    public void Quay_2a_la_dung_mot_loi()
    {
        var kq = KiemTra(s => XlTest.Bang(s, Mau, TenSheet.PhanCong).Them((TenCot.LinhVuc, "Hộ tịch"), (TenCot.Quay, "2a")));

        var loi = Assert.Single(kq.Loi);
        Assert.Equal((TenSheet.PhanCong, 2), (loi.Sheet, loi.Dong!.Value));
        Assert.Contains("Quầy", loi.LyDo, StringComparison.Ordinal);
    }

    [Fact]
    public void Linh_vuc_trung_theo_ma_la_loi()
    {
        var kq = KiemTra(s =>
        {
            var b = XlTest.Bang(s, Mau, TenSheet.PhanCong);
            b.Them((TenCot.LinhVuc, "Hộ tịch"));
            b.Them((TenCot.LinhVuc, "HỘ  TỊCH"));
        });

        var loi = Assert.Single(kq.Loi);
        Assert.Equal(3, loi.Dong);
    }

    [Fact]
    public void Thieu_linh_vuc_hoac_ho_ten_la_loi()
    {
        var kq = KiemTra(s =>
        {
            XlTest.Bang(s, Mau, TenSheet.PhanCong).Them((TenCot.Quay, 1));
            XlTest.Bang(s, Mau, TenSheet.NhanSu).Them((TenCot.Quay, 1));
            XlTest.Bang(s, Mau, TenSheet.NhanSu).Them((TenCot.HoTen, "Cán bộ mẫu"), (TenCot.Quay, "0"));
        });

        Assert.Equal(3, kq.Loi.Count);
    }

    [Fact]
    public void Nhan_su_giu_thu_tu_dong()
    {
        var kq = KiemTra(s =>
        {
            var b = XlTest.Bang(s, Mau, TenSheet.NhanSu);
            b.Them((TenCot.HoTen, "B"), (TenCot.XungHo, "Ông"), (TenCot.Quay, 2));
            b.Them((TenCot.HoTen, "A"), (TenCot.ChucVu, "Chuyên viên"), (TenCot.MoTaCongViec, "Tiếp nhận"));
        });

        Assert.Empty(kq.Loi);
        Assert.Equal(["B", "A"], kq.DuLieu.NhanSu.Select(n => n.HoTen));
        Assert.Equal([1, 2], kq.DuLieu.NhanSu.Select(n => n.ThuTu));
        Assert.Equal("Ông", kq.DuLieu.NhanSu[0].XungHo);
    }

    [Fact]
    public void Xung_ho_qua_20_ky_tu_la_loi()
    {
        var kq = KiemTra(s => XlTest.Bang(s, Mau, TenSheet.NhanSu).Them((TenCot.HoTen, "A"), (TenCot.XungHo, new string('x', 21))));

        Assert.Single(kq.Loi);
    }

    [Fact]
    public void Canh_bao_linh_vuc_khong_co_trong_danh_muc_chi_khi_co_danh_muc()
    {
        void Dat(ClosedXML.Excel.XLWorkbook s)
            => XlTest.Bang(s, Mau, TenSheet.PhanCong).Them((TenCot.LinhVuc, "Hộ tịch"));

        var coDanhMuc = KiemTra(Dat, new HashSet<string> { "dat-dai" });
        var khongCo = KiemTra(Dat, null);
        var coMa = KiemTra(Dat, new HashSet<string> { "ho-tich" });

        Assert.Single(coDanhMuc.CanhBao);
        Assert.Empty(khongCo.CanhBao);
        Assert.Empty(coMa.CanhBao);
        Assert.Empty(coDanhMuc.Loi);
    }
}
