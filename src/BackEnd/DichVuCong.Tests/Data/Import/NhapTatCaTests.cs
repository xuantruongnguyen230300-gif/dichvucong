using ClosedXML.Excel;
using DichVuCong.Import;
using DichVuCong.Import.Excel;

namespace DichVuCong.Tests.Data.Import;

/// <summary>Lệnh <c>nhap</c> ở phần không cần DB: kiểm cả file, chặn khi có lỗi, <c>--chi-kiem</c> (plan F01 §5.1).</summary>
public sealed class NhapTatCaTests : IDisposable
{
    private readonly string _thuMuc = Directory.CreateTempSubdirectory("dvc-tatca-").FullName;

    public void Dispose() => Directory.Delete(_thuMuc, recursive: true);

    private string Duong(FileMau mau) => Path.Combine(_thuMuc, mau.TenFile);

    private static void Luu(XLWorkbook s, string duongDan)
    {
        GhiExcel.LuuDe(s, duongDan);
        s.Dispose();
    }

    /// <summary>Ghi bộ 4 file nhỏ hợp lệ vào thư mục tạm.</summary>
    private void TaoBoHopLe()
    {
        var tt = GhiExcel.TaoMau(MauExcel.ThuTuc, dienSan: false);
        XlTest.Bang(tt, MauExcel.ThuTuc, TenSheet.ThuTuc).Them(
            (TenCot.MaThuTuc, "1.001193"), (TenCot.TenThuTuc, "Thủ tục đăng ký khai sinh"), (TenCot.LinhVuc, "Hộ tịch"),
            (TenCot.DanhMucXa, true), (TenCot.DanhMucTinh, true), (TenCot.MucDo, "Toàn trình"), (TenCot.ThoiHanGiaiQuyet, "1 Khác"));
        XlTest.Bang(tt, MauExcel.ThuTuc, TenSheet.ThuongGap).Them((TenCot.MaThuTuc, "1.001193"), (TenCot.ThuTu, 1));
        XlTest.Bang(tt, MauExcel.ThuTuc, TenSheet.ThanhPhanHoSo).Them((TenCot.MaThuTuc, "1.001193"), (TenCot.TenGiayTo, "- Tờ khai"), (TenCot.SoBanChinh, 0), (TenCot.SoBanSao, 0));
        Luu(tt, Duong(MauExcel.ThuTuc));

        Luu(GhiExcel.TaoMau(MauExcel.PhanCong, dienSan: false), Duong(MauExcel.PhanCong));

        var tm = GhiExcel.TaoMau(MauExcel.TrungTam, dienSan: false);
        var bang = XlTest.Bang(tm, MauExcel.TrungTam, TenSheet.TrungTam);
        bang.Them((TenCot.Muc, MauExcel.MucTenDonVi), (TenCot.GiaTri, "Trung tâm Phục vụ hành chính công xã Cần Giuộc"));
        bang.Them((TenCot.Muc, MauExcel.MucNguoiChiuTrachNhiem), (TenCot.GiaTri, "Nguyễn Văn Thử"));
        bang.Them((TenCot.Muc, MauExcel.MucDiaChi), (TenCot.GiaTri, "Quốc lộ 50"));
        bang.Them((TenCot.Muc, MauExcel.MucDienThoai), (TenCot.GiaTri, "02723 893 900"));
        bang.Them((TenCot.Muc, MauExcel.MucEmail), (TenCot.GiaTri, "cangiuoc@tayninh.gov.vn"));
        XlTest.Bang(tm, MauExcel.TrungTam, TenSheet.GioLamViec).Them((TenCot.Thu, "Thứ Hai"), (TenCot.SangTu, "07:00"), (TenCot.SangDen, "11:30"));
        XlTest.Bang(tm, MauExcel.TrungTam, TenSheet.LienKet).Them((TenCot.Ten, MauExcel.CongDvcQuocGia), (TenCot.DiaChiWeb, "https://dichvucong.gov.vn"));
        XlTest.Bang(tm, MauExcel.TrungTam, TenSheet.ODichVu).Them((TenCot.Ten, "Đánh giá hài lòng"), (TenCot.BieuTuong, "danh-gia"));
        Luu(tm, Duong(MauExcel.TrungTam));

        var tl = GhiExcel.TaoMau(MauExcel.TroLy, dienSan: false);
        XlTest.Bang(tl, MauExcel.TroLy, TenSheet.CauHoiMau).Them((TenCot.CauHoi, "Trung tâm ở đâu?"), (TenCot.MucThongTinTrungTam, "Địa chỉ"));
        XlTest.Bang(tl, MauExcel.TroLy, TenSheet.CauHoiMau).Them((TenCot.CauHoi, "Khai sinh thế nào?"), (TenCot.CauTraLoi, "Nộp hồ sơ."), (TenCot.MaThuTucLienQuan, "1.001193"));
        XlTest.Bang(tl, MauExcel.TroLy, TenSheet.ChuDeGoiY).Them((TenCot.TenHienThi, "Hộ tịch"), (TenCot.LinhVuc, "Hộ tịch"));
        XlTest.Bang(tl, MauExcel.TroLy, TenSheet.TuDongNghia).Them((TenCot.Tu, "ket hon"), (TenCot.CachNoiKhac, "cuoi vo"));
        XlTest.Bang(tl, MauExcel.TroLy, TenSheet.VietTat).Them((TenCot.VietTat, "TTHC"), (TenCot.DayDu, "thủ tục hành chính"));
        Luu(tl, Duong(MauExcel.TroLy));
    }

    [Fact]
    public async Task Tat_ca_chi_kiem_hop_le_ma_0_in_so_ban_ghi_va_canh_bao()
    {
        TaoBoHopLe();

        var (ma, ra, loi) = await TaoMauTests.Chay(["nhap", "tat-ca", _thuMuc, "--chi-kiem"]);

        Assert.Equal((int)MaThoat.ThanhCong, ma);
        Assert.Equal(string.Empty, loi);
        Assert.Contains("Thủ tục: 1", ra, StringComparison.Ordinal);
        Assert.Contains("Thường gặp: 1", ra, StringComparison.Ordinal);
        Assert.Contains("Phân công: 0 · Nhân sự: 0", ra, StringComparison.Ordinal);
        Assert.Contains("Giờ làm việc: 1 ngày", ra, StringComparison.Ordinal);
        Assert.Contains("Câu hỏi mẫu: 2 (1 câu theo mục thông tin Trung tâm)", ra, StringComparison.Ordinal);
        Assert.Contains("Chủ đề gợi ý: 1", ra, StringComparison.Ordinal);
        Assert.Contains("\"Khác\"", ra, StringComparison.Ordinal); // cảnh báo thời hạn
        Assert.DoesNotContain("Ưu tiên", ra, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Thieu_mot_file_trong_thu_muc_la_ma_2()
    {
        TaoBoHopLe();
        File.Delete(Duong(MauExcel.PhanCong));

        var (ma, _, loi) = await TaoMauTests.Chay(["nhap", "tat-ca", _thuMuc, "--chi-kiem"]);

        Assert.Equal((int)MaThoat.SaiLenh, ma);
        Assert.Contains(MauExcel.TenFilePhanCong, loi, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Thu_muc_khong_co_la_ma_2()
    {
        var (ma, _, _) = await TaoMauTests.Chay(["nhap", "tat-ca", Path.Combine(_thuMuc, "khong-co"), "--chi-kiem"]);

        Assert.Equal((int)MaThoat.SaiLenh, ma);
    }

    [Fact]
    public async Task Mot_file_co_loi_la_ma_1_in_dung_so_dong_loi_va_khong_in_ket_qua_nhap()
    {
        TaoBoHopLe();
        // Sửa file thủ tục: 2 thủ tục lỗi + 1 dòng thường gặp lỗi = 3 dòng lỗi.
        using (var s = DocExcel.Mo(Duong(MauExcel.ThuTuc)))
        {
            var b = XlTest.Bang(s, MauExcel.ThuTuc, TenSheet.ThuTuc);
            b.Them((TenCot.MaThuTuc, "1.000894"), (TenCot.LinhVuc, "Hộ tịch"), (TenCot.DanhMucXa, true), (TenCot.MucDo, "Toàn trình"));
            b.Them((TenCot.MaThuTuc, "1.000656"), (TenCot.TenThuTuc, "Đăng ký khai tử"), (TenCot.LinhVuc, "Hộ tịch"), (TenCot.DanhMucXa, true), (TenCot.MucDo, "Toàn phần"));
            XlTest.Bang(s, MauExcel.ThuTuc, TenSheet.ThuongGap).Them((TenCot.MaThuTuc, "9.999999"), (TenCot.ThuTu, 2));
            GhiExcel.LuuDe(s, Duong(MauExcel.ThuTuc));
        }

        var (ma, ra, loi) = await TaoMauTests.Chay(["nhap", "tat-ca", _thuMuc, "--chi-kiem"]);

        Assert.Equal((int)MaThoat.FileCoLoi, ma);
        Assert.DoesNotContain("Đã nhập", ra, StringComparison.Ordinal);
        var dong = loi.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        Assert.Contains("File thu-tuc.xlsx có 3 dòng lỗi", dong[0], StringComparison.Ordinal);
        Assert.Contains("Thủ tục · dòng 3: thiếu Tên thủ tục", dong[1], StringComparison.Ordinal);
        Assert.Contains("Thủ tục · dòng 4: Mức độ \"Toàn phần\"", dong[2], StringComparison.Ordinal);
        Assert.Contains("Thường gặp · dòng 3: Mã 9.999999 không có trong sheet Thủ tục", dong[3], StringComparison.Ordinal);
    }

    [Fact]
    public async Task Tro_ly_doi_chieu_ma_thu_tuc_voi_file_thu_tuc_cung_lan_chay()
    {
        TaoBoHopLe();
        using (var s = DocExcel.Mo(Duong(MauExcel.TroLy)))
        {
            XlTest.Bang(s, MauExcel.TroLy, TenSheet.CauHoiMau)
                .Them((TenCot.CauHoi, "Hỏi lạ?"), (TenCot.CauTraLoi, "a"), (TenCot.MaThuTucLienQuan, "9.999999"));
            GhiExcel.LuuDe(s, Duong(MauExcel.TroLy));
        }

        var (ma, _, loi) = await TaoMauTests.Chay(["nhap", "tat-ca", _thuMuc, "--chi-kiem"]);

        Assert.Equal((int)MaThoat.FileCoLoi, ma);
        Assert.Contains("tro-ly.xlsx có 1 dòng lỗi", loi, StringComparison.Ordinal);
        Assert.Contains("9.999999", loi, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Phan_cong_doi_chieu_linh_vuc_voi_file_thu_tuc_cung_lan_chay_canh_bao_chu_khong_loi()
    {
        TaoBoHopLe();
        using (var s = DocExcel.Mo(Duong(MauExcel.PhanCong)))
        {
            XlTest.Bang(s, MauExcel.PhanCong, TenSheet.PhanCong).Them((TenCot.LinhVuc, "Lĩnh vực lạ"), (TenCot.Quay, 3));
            GhiExcel.LuuDe(s, Duong(MauExcel.PhanCong));
        }

        var (ma, ra, _) = await TaoMauTests.Chay(["nhap", "tat-ca", _thuMuc, "--chi-kiem"]);

        Assert.Equal((int)MaThoat.ThanhCong, ma);
        Assert.Contains("Lĩnh vực lạ", ra, StringComparison.Ordinal);
        Assert.Contains("Phân công: 1", ra, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Nhap_mot_loai_chi_kiem_khong_can_chuoi_ket_noi_va_file_cu_van_doc_duoc()
    {
        TaoBoHopLe();

        var (ma, ra, _) = await TaoMauTests.Chay(["nhap", "trung-tam", Duong(MauExcel.TrungTam), "--chi-kiem"]);

        Assert.Equal((int)MaThoat.ThanhCong, ma);
        Assert.Contains("hợp lệ", ra, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Thieu_email_khong_nhap_thong_bao_nhac_email()
    {
        TaoBoHopLe();
        using (var s = DocExcel.Mo(Duong(MauExcel.TrungTam)))
        {
            s.Worksheet(TenSheet.TrungTam).Row(6).Delete(); // dòng Email
            GhiExcel.LuuDe(s, Duong(MauExcel.TrungTam));
        }

        var (ma, _, loi) = await TaoMauTests.Chay(["nhap", "trung-tam", Duong(MauExcel.TrungTam), "--chi-kiem"]);

        Assert.Equal((int)MaThoat.FileCoLoi, ma);
        Assert.Contains("Email", loi, StringComparison.Ordinal);
    }

    [Fact]
    public async Task File_dang_mo_trong_excel_van_kiem_duoc()
    {
        TaoBoHopLe();
        using var giu = new FileStream(Duong(MauExcel.ThuTuc), FileMode.Open, FileAccess.ReadWrite, FileShare.Read);

        var (ma, _, _) = await TaoMauTests.Chay(["nhap", "thu-tuc", Duong(MauExcel.ThuTuc), "--chi-kiem"]);

        Assert.Equal((int)MaThoat.ThanhCong, ma);
    }
}
