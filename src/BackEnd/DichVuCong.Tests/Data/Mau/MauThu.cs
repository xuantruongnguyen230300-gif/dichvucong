using DichVuCong.Data.Entities;
using DichVuCong.Data.Mau;
using DichVuCong.Import.Excel;
using DichVuCong.Import.KiemTra;
using DichVuCong.Import.Loai.PhanCong;
using DichVuCong.Import.Loai.ThuTuc;
using DichVuCong.Import.Loai.TroLy;
using DichVuCong.Import.Loai.TrungTam;
using DichVuCong.Tests.Data.Import;
using TrungTamEntity = DichVuCong.Data.Entities.TrungTam;

namespace DichVuCong.Tests.Data.Mau;

/// <summary>Bộ dữ liệu nhỏ cho test <see cref="TepDuLieuMau"/> và nguồn dữ liệu, có đủ kiểu cột.</summary>
internal static class MauThu
{
    public static readonly DateTimeOffset ThoiDiem = new(2026, 10, 12, 9, 0, 0, TimeSpan.Zero);

    /// <summary>JSON tối thiểu hợp lệ: chỉ có hai trường bắt buộc.</summary>
    public const string JsonToiThieu = """{"phienBan":1,"thoiDiem":"2026-10-12T09:00:00+00:00"}""";

    /// <summary>
    /// Dựng bằng mã. Thủ tục không xếp theo <c>ThuTu</c> (2, 3, 1) để test thứ tự của <c>LinhVuc.ThuTucs</c>.
    /// Chưa nối navigation: gọi <see cref="TepDuLieuMau.KiemTraVaNoi"/> hoặc đi qua ghi rồi đọc.
    /// </summary>
    public static TepDuLieuMau TuMa()
    {
        var tep = new TepDuLieuMau { ThoiDiem = ThoiDiem, GhiChu = "Dữ liệu thử, không phải dữ liệu thật." };

        tep.LinhVuc.Add(new LinhVuc { Ma = "ho-tich", Ten = "Hộ tịch", TenTimKiem = "ho tich" });
        tep.LinhVuc.Add(new LinhVuc { Ma = "dat-dai", Ten = "Đất đai", TenTimKiem = "dat dai" });

        tep.ThuTuc.Add(new ThuTuc
        {
            Ma = "1.001193",
            Ten = "Thủ tục đăng ký khai sinh",
            TenTimKiem = "thu tuc dang ky khai sinh",
            LinhVucMa = "ho-tich",
            ThuocDanhMucXa = true,
            ThuocDanhMucTinh = true,
            MucDo = MucDo.ToanTrinh,
            CoQuanThucHien = "UBND xã",
            YeuCauDieuKien = "Không",
            TrangThaiCongBo = "Đã công bố",
            ThoiHan = "1 ngày làm việc",
            Phi = "Miễn phí",
            HinhThucNop = ["Trực tuyến", "Bưu chính", "Trực tiếp"],
            MaDvc = "1.001193.000.00.00.H53",
            DonViTen = "UBND xã Cần Giuộc",
            DonViMa = "H53.183",
            ThuTu = 2,
            ThuTuThuongGap = 1,
            TrinhTu = [new() { TruongHop = null, NoiDung = "Bước 1\nDòng 2" }, new() { TruongHop = "Nộp trực tiếp", NoiDung = "Bước 2" }],
            CachThuc = [new() { HinhThuc = "Trực tuyến", ThoiHan = "1 ngày", Phi = null, MoTa = null }, new() { HinhThuc = null, ThoiHan = null, Phi = "0", MoTa = "Mô tả" }],
            ThanhPhanHoSo = [new() { Ten = "Tờ khai", BanChinh = 1, BanSao = null }, new() { Ten = "Giấy chứng sinh", BanChinh = null, BanSao = 2 }],
            KetQua = ["Giấy khai sinh", "Trích lục"],
            CanCu = [new() { SoKyHieu = "85/2019/TT-BTC", TrichYeu = "Thông tư <phí> & lệ phí" }, new() { SoKyHieu = null, TrichYeu = null }],
        });
        tep.ThuTuc.Add(new ThuTuc
        {
            Ma = "2.000815",
            Ten = "Chứng thực bản sao",
            TenTimKiem = "chung thuc ban sao",
            LinhVucMa = "dat-dai",
            ThuocDanhMucXa = false,
            ThuocDanhMucTinh = true,
            MucDo = MucDo.MotPhan,
            ThuTu = 3,
        });
        tep.ThuTuc.Add(new ThuTuc
        {
            Ma = "1.000894",
            Ten = "Đăng ký kết hôn",
            TenTimKiem = "dang ky ket hon",
            LinhVucMa = "ho-tich",
            ThuocDanhMucXa = true,
            MucDo = MucDo.ToanTrinh,
            ThuTu = 1,
        });

        tep.PhanCongLinhVuc.Add(new PhanCongLinhVuc { LinhVucMa = "ho-tich", TenLinhVuc = "Hộ tịch", Quay = 3, NoiTiepNhanChuyen = null });
        tep.PhanCongLinhVuc.Add(new PhanCongLinhVuc { LinhVucMa = "dat-dai", TenLinhVuc = "Đất đai", Quay = null, NoiTiepNhanChuyen = "Văn phòng đăng ký đất đai" });
        tep.NhanSu.Add(new NhanSu { ThuTu = 1, HoTen = "Nguyễn Văn Thử", XungHo = "Ông", ChucVu = "Chuyên viên", Quay = 3, MoTa = null });
        tep.NhanSu.Add(new NhanSu { ThuTu = 2, HoTen = "Trần Thị Mẫu" });

        tep.TrungTam = new TrungTamEntity
        {
            Ten = "Trung tâm Phục vụ hành chính công xã Cần Giuộc",
            NguoiChiuTrachNhiem = "(dữ liệu mẫu)",
            ChucVuNguoiChiuTrachNhiem = "Giám đốc",
            CoQuanChuQuan = "UBND xã Cần Giuộc",
            DiaChi = "Quốc lộ 50",
            DienThoai = "02723 893 900",
            Email = "cangiuoc@tayninh.gov.vn",
            Xa = "xã Cần Giuộc",
            Tinh = "Tây Ninh",
            MaDonViCongDvc = "H53.183",
            BanDo = null,
            Facebook = "https://facebook.com/x",
        };
        tep.GioLamViec.Add(new GioLamViec { Thu = 1, SangTu = new TimeOnly(7, 0), SangDen = new TimeOnly(11, 30), ChieuTu = new TimeOnly(13, 30), ChieuDen = new TimeOnly(17, 0) });
        tep.GioLamViec.Add(new GioLamViec { Thu = 6, SangTu = new TimeOnly(7, 0), SangDen = new TimeOnly(11, 0) });
        tep.LienKet.Add(new LienKet { ThuTu = 1, Ten = "Cổng Dịch vụ công Quốc gia", Url = "https://dichvucong.gov.vn" });
        tep.ODichVu.Add(new ODichVu { ThuTu = 1, Ten = "Đánh giá hài lòng", MoTa = null, BieuTuong = "danh-gia", Url = null });
        tep.ODichVu.Add(new ODichVu { ThuTu = 2, Ten = "Tra cứu hồ sơ", MoTa = "Xem hồ sơ", BieuTuong = "tra-cuu-ho-so", Url = "https://dichvucong.gov.vn/tra-cuu" });

        var cauA = new CauHoiMau { ThuTu = 1, CauHoi = "Khai sinh ở đâu?", TraLoi = "Nộp tại UBND xã.", MaThuTuc = ["1.001193"] };
        cauA.CachHoi.Add(new CauHoiMauCachHoi { ThuTu = 1, NoiDung = "Khai sinh ở đâu?", NoiDungTimKiem = "khai sinh o dau?" });
        cauA.CachHoi.Add(new CauHoiMauCachHoi { ThuTu = 2, NoiDung = "Đăng ký khai sinh", NoiDungTimKiem = "dang ky khai sinh" });
        var cauB = new CauHoiMau { ThuTu = 2, CauHoi = "Trung tâm ở đâu?", MucTrungTam = MucTrungTam.DiaChi };
        cauB.CachHoi.Add(new CauHoiMauCachHoi { ThuTu = 1, NoiDung = "Trung tâm ở đâu?", NoiDungTimKiem = "trung tam o dau?" });
        tep.CauHoiMau.Add(cauA);
        tep.CauHoiMau.Add(cauB);
        tep.ChuDeGoiY.Add(new ChuDeGoiY { ThuTu = 1, TenHienThi = "Hộ tịch", TenLinhVuc = "Hộ tịch", LinhVucMa = "ho-tich" });
        tep.TuDongNghia.Add(new TuDongNghia { ThuTu = 1, Tu = "kết hôn", TuTimKiem = "ket hon", CachNoiKhac = ["cưới vợ", "lấy chồng"] });
        tep.VietTat.Add(new VietTat { ThuTu = 1, ChuVietTat = "TTHC", ChuVietTatTimKiem = "tthc", DayDu = "thủ tục hành chính" });
        return tep;
    }

    /// <summary>Dựng bằng đường nhập của Import (workbook trong bộ nhớ, rồi <c>KiemTra*</c>): đúng các entity mà <c>nhap tat-ca</c> sẽ ghi vào DB.</summary>
    public static TepDuLieuMau TuKiemTraImport()
    {
        var thuTuc = DocThuTuc();
        var phanCong = DocPhanCong();
        var trungTam = DocTrungTam();
        var troLy = DocTroLy();

        var tep = new TepDuLieuMau { ThoiDiem = ThoiDiem, GhiChu = "Từ KiemTra* của Import." };
        tep.LinhVuc.AddRange(thuTuc.DuLieu.LinhVuc);
        tep.ThuTuc.AddRange(thuTuc.DuLieu.ThuTuc);
        tep.PhanCongLinhVuc.AddRange(phanCong.DuLieu.PhanCong);
        tep.NhanSu.AddRange(phanCong.DuLieu.NhanSu);
        tep.TrungTam = trungTam.DuLieu.TrungTam;
        tep.GioLamViec.AddRange(trungTam.DuLieu.GioLamViec);
        tep.LienKet.AddRange(trungTam.DuLieu.LienKet);
        tep.ODichVu.AddRange(trungTam.DuLieu.ODichVu);
        tep.CauHoiMau.AddRange(troLy.DuLieu.CauHoiMau);
        tep.ChuDeGoiY.AddRange(troLy.DuLieu.ChuDeGoiY);
        tep.TuDongNghia.AddRange(troLy.DuLieu.TuDongNghia);
        tep.VietTat.AddRange(troLy.DuLieu.VietTat);
        return tep;
    }

    private static KetQuaKiemTra<T> HopLe<T>(KetQuaKiemTra<T> kq)
    {
        Assert.True(kq.HopLe, string.Join("; ", kq.Loi.Select(l => l.LyDo)));
        return kq;
    }

    private static KetQuaKiemTra<DuLieuThuTuc> DocThuTuc()
    {
        using var s = XlTest.Mau(MauExcel.ThuTuc);
        var bang = XlTest.Bang(s, MauExcel.ThuTuc, TenSheet.ThuTuc);
        bang.Them(
            (TenCot.MaThuTuc, "1.001193"), (TenCot.TenThuTuc, "Thủ tục đăng ký khai sinh"), (TenCot.LinhVuc, "Hộ tịch"),
            (TenCot.DanhMucXa, true), (TenCot.DanhMucTinh, true), (TenCot.MucDo, "Toàn trình"),
            (TenCot.CoQuanThucHien, "UBND xã"), (TenCot.YeuCauDieuKien, "Không"), (TenCot.ThoiHanGiaiQuyet, "1 ngày làm việc"),
            (TenCot.PhiLePhi, "Miễn phí"), (TenCot.HinhThucNop, "Trực tuyến; Bưu chính; Trực tiếp"),
            (TenCot.MaDvc, "1.001193.000.00.00.H53"), (TenCot.TenDonViDvc, "UBND xã Cần Giuộc"), (TenCot.MaDonViDvc, "H53.183"));
        bang.Them(
            (TenCot.MaThuTuc, "2.000815"), (TenCot.TenThuTuc, "Chứng thực bản sao"), (TenCot.LinhVuc, "Đất đai"),
            (TenCot.DanhMucXa, false), (TenCot.DanhMucTinh, true), (TenCot.MucDo, "Một phần"));
        XlTest.Bang(s, MauExcel.ThuTuc, TenSheet.ThuongGap).Them((TenCot.MaThuTuc, "1.001193"), (TenCot.ThuTu, 1));
        XlTest.Bang(s, MauExcel.ThuTuc, TenSheet.TrinhTu).Them((TenCot.MaThuTuc, "1.001193"), (TenCot.NoiDung, "Bước 1"));
        XlTest.Bang(s, MauExcel.ThuTuc, TenSheet.TrinhTu).Them((TenCot.MaThuTuc, "1.001193"), (TenCot.TruongHop, "Nộp trực tiếp"), (TenCot.NoiDung, "Bước 2"));
        XlTest.Bang(s, MauExcel.ThuTuc, TenSheet.CachThuc).Them((TenCot.MaThuTuc, "1.001193"), (TenCot.HinhThucNop, "Trực tuyến"), (TenCot.ThoiHan, "1 ngày"));
        XlTest.Bang(s, MauExcel.ThuTuc, TenSheet.ThanhPhanHoSo).Them((TenCot.MaThuTuc, "1.001193"), (TenCot.TenGiayTo, "Tờ khai"), (TenCot.SoBanChinh, 1));
        XlTest.Bang(s, MauExcel.ThuTuc, TenSheet.KetQua).Them((TenCot.MaThuTuc, "1.001193"), (TenCot.TenKetQua, "Giấy khai sinh"));
        XlTest.Bang(s, MauExcel.ThuTuc, TenSheet.CanCu).Them((TenCot.MaThuTuc, "1.001193"), (TenCot.SoKyHieu, "85/2019/TT-BTC"));
        return HopLe(KiemTraThuTuc.KiemTra(XlTest.Doc(s, MauExcel.ThuTuc)));
    }

    private static KetQuaKiemTra<DuLieuPhanCong> DocPhanCong()
    {
        using var s = XlTest.Mau(MauExcel.PhanCong);
        XlTest.Bang(s, MauExcel.PhanCong, TenSheet.PhanCong).Them((TenCot.LinhVuc, "Hộ tịch"), (TenCot.Quay, 3));
        XlTest.Bang(s, MauExcel.PhanCong, TenSheet.PhanCong).Them((TenCot.LinhVuc, "Đất đai"), (TenCot.NoiTiepNhanChuyen, "Văn phòng đăng ký đất đai"));
        XlTest.Bang(s, MauExcel.PhanCong, TenSheet.NhanSu).Them((TenCot.HoTen, "Nguyễn Văn Thử"), (TenCot.XungHo, "Ông"), (TenCot.ChucVu, "Chuyên viên"), (TenCot.Quay, 3));
        XlTest.Bang(s, MauExcel.PhanCong, TenSheet.NhanSu).Them((TenCot.HoTen, "Trần Thị Mẫu"));
        return HopLe(KiemTraPhanCong.KiemTra(XlTest.Doc(s, MauExcel.PhanCong), null));
    }

    private static KetQuaKiemTra<DuLieuTrungTam> DocTrungTam()
    {
        using var s = XlTest.Mau(MauExcel.TrungTam);
        var tt = XlTest.Bang(s, MauExcel.TrungTam, TenSheet.TrungTam);
        tt.Them((TenCot.Muc, MauExcel.MucTenDonVi), (TenCot.GiaTri, "Trung tâm Phục vụ hành chính công xã Cần Giuộc"));
        tt.Them((TenCot.Muc, MauExcel.MucNguoiChiuTrachNhiem), (TenCot.GiaTri, "(dữ liệu mẫu)"));
        tt.Them((TenCot.Muc, MauExcel.MucChucVuNguoiChiuTrachNhiem), (TenCot.GiaTri, "Giám đốc"));
        tt.Them((TenCot.Muc, MauExcel.MucDiaChi), (TenCot.GiaTri, "Quốc lộ 50, xã Cần Giuộc"));
        tt.Them((TenCot.Muc, MauExcel.MucDienThoai), (TenCot.GiaTri, "02723 893 900"));
        tt.Them((TenCot.Muc, MauExcel.MucEmail), (TenCot.GiaTri, "cangiuoc@tayninh.gov.vn"));
        tt.Them((TenCot.Muc, MauExcel.MucMaDonVi), (TenCot.GiaTri, "H53.183"));
        tt.Them((TenCot.Muc, MauExcel.MucFacebook), (TenCot.GiaTri, "https://facebook.com/x"));
        tt.Them((TenCot.Muc, MauExcel.MucBanDo));
        var gio = XlTest.Bang(s, MauExcel.TrungTam, TenSheet.GioLamViec);
        gio.Them((TenCot.Thu, "Thứ Hai"), (TenCot.SangTu, "07:00"), (TenCot.SangDen, "11:30"), (TenCot.ChieuTu, "13:30"), (TenCot.ChieuDen, "17:00"));
        gio.Them((TenCot.Thu, "Thứ Sáu"), (TenCot.SangTu, "07:00"), (TenCot.SangDen, "11:00"));
        XlTest.Bang(s, MauExcel.TrungTam, TenSheet.LienKet).Them((TenCot.Ten, MauExcel.CongDvcQuocGia), (TenCot.DiaChiWeb, "https://dichvucong.gov.vn"));
        var o = XlTest.Bang(s, MauExcel.TrungTam, TenSheet.ODichVu);
        o.Them((TenCot.Ten, "Đánh giá hài lòng"), (TenCot.BieuTuong, "danh-gia"));
        o.Them((TenCot.Ten, "Tra cứu hồ sơ"), (TenCot.MoTa, "Xem hồ sơ"), (TenCot.BieuTuong, "tra-cuu-ho-so"), (TenCot.DiaChiWeb, "https://dichvucong.gov.vn/tra-cuu"));
        return HopLe(KiemTraTrungTam.KiemTra(XlTest.Doc(s, MauExcel.TrungTam)));
    }

    private static KetQuaKiemTra<DuLieuTroLy> DocTroLy()
    {
        using var s = XlTest.Mau(MauExcel.TroLy);
        var cau = XlTest.Bang(s, MauExcel.TroLy, TenSheet.CauHoiMau);
        cau.Them((TenCot.CauHoi, "Khai sinh ở đâu?"), (TenCot.CachHoiKhac, "đăng ký khai sinh; khai sinh nộp ở đâu"), (TenCot.CauTraLoi, "Nộp tại UBND xã.\nDòng 2"), (TenCot.MaThuTucLienQuan, "1.001193"));
        cau.Them((TenCot.CauHoi, "Trung tâm ở đâu?"), (TenCot.MucThongTinTrungTam, "Địa chỉ"));
        XlTest.Bang(s, MauExcel.TroLy, TenSheet.ChuDeGoiY).Them((TenCot.TenHienThi, "Hộ tịch"), (TenCot.LinhVuc, "Hộ tịch"));
        XlTest.Bang(s, MauExcel.TroLy, TenSheet.TuDongNghia).Them((TenCot.Tu, "kết hôn"), (TenCot.CachNoiKhac, "cưới vợ; lấy chồng"));
        XlTest.Bang(s, MauExcel.TroLy, TenSheet.VietTat).Them((TenCot.VietTat, "TTHC"), (TenCot.DayDu, "thủ tục hành chính"));
        return HopLe(KiemTraTroLy.KiemTra(XlTest.Doc(s, MauExcel.TroLy), null, null));
    }
}
