using DichVuCong.Data.Text;

namespace DichVuCong.Import.Excel;

/// <summary>Kiểu giá trị của một cột trong file Excel (plan F01 §3.1).</summary>
internal enum KieuO
{
    Chu,
    Ma,
    DanhDau,
    LuaChon,
    SoDuong,
    SoKhongAm,
    Gio,
    DanhSach,
    DanhSachMa,
    Url,
    Email,
    DienThoai,
}

internal sealed record CotMau(
    string Ten,
    KieuO Kieu,
    bool BatBuoc = false,
    int DoDai = MauExcel.DoDaiO,
    IReadOnlyList<string>? LuaChon = null);

internal sealed record SheetMau(string Ten, IReadOnlyList<CotMau> Cot)
{
    public CotMau? TimCot(string ten) => Cot.FirstOrDefault(c => MauExcel.SoKhop(c.Ten, ten));
}

/// <param name="TenFile">Tên file trong lệnh <c>tat-ca</c> và <c>tao-mau</c>.</param>
/// <param name="Sheet">Các sheet của file.</param>
internal sealed record FileMau(string TenFile, IReadOnlyList<SheetMau> Sheet)
{
    public SheetMau this[string tenSheet] => Sheet.First(s => s.Ten == tenSheet);
}

/// <param name="Ten">Tên mục ở cột "Mục" của sheet Trung tâm.</param>
/// <param name="Kieu">Kiểu giá trị của mục.</param>
/// <param name="BatBuoc">Mục bắt buộc theo BR-8.</param>
/// <param name="DoDai">Độ dài tối đa.</param>
internal sealed record MucTrungTamMau(string Ten, KieuO Kieu, bool BatBuoc, int DoDai = MauExcel.DoDaiO);

internal static class TenSheet
{
    public const string ThuTuc = "Thủ tục";
    public const string ThuongGap = "Thường gặp";
    public const string TrinhTu = "Trình tự";
    public const string CachThuc = "Cách thức";
    public const string ThanhPhanHoSo = "Thành phần hồ sơ";
    public const string KetQua = "Kết quả";
    public const string CanCu = "Căn cứ pháp lý";
    public const string PhanCong = "Phân công";
    public const string NhanSu = "Nhân sự";
    public const string TrungTam = "Trung tâm";
    public const string GioLamViec = "Giờ làm việc";
    public const string LienKet = "Liên kết";
    public const string ODichVu = "Ô dịch vụ";
    public const string CauHoiMau = "Câu hỏi mẫu";
    public const string ChuDeGoiY = "Chủ đề gợi ý";
    public const string TuDongNghia = "Từ đồng nghĩa";
    public const string VietTat = "Viết tắt";
    public const string HuongDan = "Hướng dẫn";
}

internal static class TenCot
{
    public const string MaThuTuc = "Mã thủ tục";
    public const string TenThuTuc = "Tên thủ tục";
    public const string LinhVuc = "Lĩnh vực";
    public const string DanhMucXa = "Danh mục cấp xã";
    public const string DanhMucTinh = "Danh mục cấp tỉnh";
    public const string MucDo = "Mức độ";
    public const string CoQuanThucHien = "Cơ quan thực hiện";
    public const string YeuCauDieuKien = "Yêu cầu, điều kiện";
    public const string TrangThaiCongBo = "Trạng thái công bố";
    public const string ThoiHanGiaiQuyet = "Thời hạn giải quyết";
    public const string PhiLePhi = "Phí, lệ phí";
    public const string HinhThucNop = "Hình thức nộp";
    public const string MaDvc = "Mã DVC";
    public const string TenDonViDvc = "Tên đơn vị trên Cổng DVC";
    public const string MaDonViDvc = "Mã đơn vị trên Cổng DVC";
    public const string ThuTu = "Thứ tự";
    public const string TruongHop = "Trường hợp";
    public const string NoiDung = "Nội dung";
    public const string ThoiHan = "Thời hạn";
    public const string MoTa = "Mô tả";
    public const string TenGiayTo = "Tên giấy tờ";
    public const string SoBanChinh = "Số bản chính";
    public const string SoBanSao = "Số bản sao";
    public const string TenKetQua = "Tên kết quả";
    public const string SoKyHieu = "Số ký hiệu";
    public const string TrichYeu = "Trích yếu";
    public const string Quay = "Quầy";
    public const string NoiTiepNhanChuyen = "Nơi tiếp nhận chuyển";
    public const string HoTen = "Họ tên";
    public const string XungHo = "Xưng hô";
    public const string ChucVu = "Chức vụ";
    public const string MoTaCongViec = "Mô tả công việc";
    public const string Muc = "Mục";
    public const string GiaTri = "Giá trị";
    public const string Thu = "Thứ";
    public const string SangTu = "Sáng từ";
    public const string SangDen = "Sáng đến";
    public const string ChieuTu = "Chiều từ";
    public const string ChieuDen = "Chiều đến";
    public const string Ten = "Tên";
    public const string DiaChiWeb = "Địa chỉ web";
    public const string BieuTuong = "Biểu tượng";
    public const string CauHoi = "Câu hỏi";
    public const string CachHoiKhac = "Cách hỏi khác";
    public const string CauTraLoi = "Câu trả lời";
    public const string MucThongTinTrungTam = "Mục thông tin Trung tâm";
    public const string MaThuTucLienQuan = "Mã thủ tục liên quan";
    public const string TenHienThi = "Tên hiển thị";
    public const string Tu = "Từ";
    public const string CachNoiKhac = "Cách nói khác";
    public const string VietTat = "Viết tắt";
    public const string DayDu = "Dạng đầy đủ";
    public const string GhiChu = "Ghi chú";
}

/// <summary>Nguồn duy nhất cho 4 file Excel của công cụ nhập: sheet, cột, bắt buộc, kiểu, độ dài, danh sách lựa chọn.</summary>
internal static class MauExcel
{
    public const long DungLuongToiDa = 20L * 1024 * 1024;

    /// <summary>Tổng dung lượng giải nén của mọi phần trong file .xlsx (chống zip bomb).</summary>
    public const long GiaiNenToiDa = 100L * 1024 * 1024;

    /// <summary>Số dòng tối đa mỗi sheet (kể cả dòng tiêu đề).</summary>
    public const int SoDongToiDa = 100_000;

    /// <summary>Giới hạn một ô Excel; DB dùng <c>text</c>.</summary>
    public const int DoDaiO = 32767;

    public const int DoDaiMa = 20;
    public const int DoDaiMaDvc = 30;
    public const int DoDaiLinhVuc = 200;
    public const int DoDaiCauHoi = 500;
    public const int DoDaiEmail = 254;
    public const int DoDaiUrl = 2000;
    public const int DoDaiDienThoai = 30;

    public const string BieuTuongMacDinh = "lien-ket";
    public const string CongDvcQuocGia = "Cổng Dịch vụ công Quốc gia";

    public const string TenFileThuTuc = "thu-tuc.xlsx";
    public const string TenFilePhanCong = "phan-cong.xlsx";
    public const string TenFileTrungTam = "trung-tam.xlsx";
    public const string TenFileTroLy = "tro-ly.xlsx";

    public const string MucTenDonVi = "Tên đơn vị";
    public const string MucNguoiChiuTrachNhiem = "Người chịu trách nhiệm";
    public const string MucChucVuNguoiChiuTrachNhiem = "Chức vụ người chịu trách nhiệm";
    public const string MucCoQuanChuQuan = "Cơ quan chủ quản";
    public const string MucDiaChi = "Địa chỉ";
    public const string MucDienThoai = "Điện thoại";
    public const string MucEmail = "Email";
    public const string MucXa = "Xã";
    public const string MucTinh = "Tỉnh";
    public const string MucMaDonVi = "Mã đơn vị trên Cổng DVC";
    public const string MucBanDo = "Bản đồ";
    public const string MucZalo = "Zalo OA";
    public const string MucFacebook = "Facebook";
    public const string MucYouTube = "YouTube";
    public const string MucTikTok = "TikTok";
    public const string MucGhiChuNgayNghi = "Ghi chú ngày nghỉ";

    public static readonly IReadOnlyList<string> MucDo = ["Toàn trình", "Một phần"];

    /// <summary>Thứ tự khớp enum <c>MucTrungTam</c> (1 đến 5).</summary>
    public static readonly IReadOnlyList<string> MucTrungTam = ["Địa chỉ", "Giờ làm việc", "Điện thoại", "Email", "Nộp trực tuyến"];

    public static readonly IReadOnlyList<string> BieuTuong =
        ["boc-so", "danh-gia", "tra-cuu-ho-so", "thanh-toan", "cong-dvc", "cong-thong-tin", BieuTuongMacDinh];

    /// <summary>Tên chuẩn của 7 thứ, theo thứ tự 1 (Thứ Hai) đến 7 (Chủ nhật).</summary>
    public static readonly IReadOnlyList<string> TenThu =
        ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ nhật"];

    public static readonly IReadOnlyList<string> DanhDau = ["x"];

    public static readonly IReadOnlyList<MucTrungTamMau> MucTrungTamSheet =
    [
        new(MucTenDonVi, KieuO.Chu, true),
        new(MucNguoiChiuTrachNhiem, KieuO.Chu, true),
        new(MucChucVuNguoiChiuTrachNhiem, KieuO.Chu, false),
        new(MucCoQuanChuQuan, KieuO.Chu, false),
        new(MucDiaChi, KieuO.Chu, true),
        new(MucDienThoai, KieuO.DienThoai, true, DoDaiDienThoai),
        new(MucEmail, KieuO.Email, true, DoDaiEmail),
        new(MucXa, KieuO.Chu, false),
        new(MucTinh, KieuO.Chu, false),
        new(MucMaDonVi, KieuO.Ma, false, DoDaiMaDvc),
        new(MucBanDo, KieuO.Url, false, DoDaiUrl),
        new(MucZalo, KieuO.Url, false, DoDaiUrl),
        new(MucFacebook, KieuO.Url, false, DoDaiUrl),
        new(MucYouTube, KieuO.Url, false, DoDaiUrl),
        new(MucTikTok, KieuO.Url, false, DoDaiUrl),
        new(MucGhiChuNgayNghi, KieuO.Chu, false),
    ];

    public static readonly FileMau ThuTuc = new(TenFileThuTuc,
    [
        new(TenSheet.ThuTuc,
        [
            new(TenCot.MaThuTuc, KieuO.Ma, true, DoDaiMa),
            new(TenCot.TenThuTuc, KieuO.Chu, true),
            new(TenCot.LinhVuc, KieuO.Chu, true, DoDaiLinhVuc),
            new(TenCot.DanhMucXa, KieuO.DanhDau),
            new(TenCot.DanhMucTinh, KieuO.DanhDau),
            new(TenCot.MucDo, KieuO.LuaChon, true, LuaChon: MucDo),
            new(TenCot.CoQuanThucHien, KieuO.Chu),
            new(TenCot.YeuCauDieuKien, KieuO.Chu),
            new(TenCot.TrangThaiCongBo, KieuO.Chu),
            new(TenCot.ThoiHanGiaiQuyet, KieuO.Chu),
            new(TenCot.PhiLePhi, KieuO.Chu),
            new(TenCot.HinhThucNop, KieuO.DanhSach),
            new(TenCot.MaDvc, KieuO.Ma, false, DoDaiMaDvc),
            new(TenCot.TenDonViDvc, KieuO.Chu),
            new(TenCot.MaDonViDvc, KieuO.Ma, false, DoDaiMaDvc),
        ]),
        new(TenSheet.ThuongGap,
        [
            new(TenCot.MaThuTuc, KieuO.Ma, true, DoDaiMa),
            new(TenCot.ThuTu, KieuO.SoDuong, true),
        ]),
        new(TenSheet.TrinhTu,
        [
            new(TenCot.MaThuTuc, KieuO.Ma, true, DoDaiMa),
            new(TenCot.TruongHop, KieuO.Chu),
            new(TenCot.NoiDung, KieuO.Chu, true),
        ]),
        new(TenSheet.CachThuc,
        [
            new(TenCot.MaThuTuc, KieuO.Ma, true, DoDaiMa),
            new(TenCot.HinhThucNop, KieuO.Chu),
            new(TenCot.ThoiHan, KieuO.Chu),
            new(TenCot.PhiLePhi, KieuO.Chu),
            new(TenCot.MoTa, KieuO.Chu),
        ]),
        new(TenSheet.ThanhPhanHoSo,
        [
            new(TenCot.MaThuTuc, KieuO.Ma, true, DoDaiMa),
            new(TenCot.TenGiayTo, KieuO.Chu, true),
            new(TenCot.SoBanChinh, KieuO.SoKhongAm),
            new(TenCot.SoBanSao, KieuO.SoKhongAm),
        ]),
        new(TenSheet.KetQua,
        [
            new(TenCot.MaThuTuc, KieuO.Ma, true, DoDaiMa),
            new(TenCot.TenKetQua, KieuO.Chu, true),
        ]),
        new(TenSheet.CanCu,
        [
            new(TenCot.MaThuTuc, KieuO.Ma, true, DoDaiMa),
            new(TenCot.SoKyHieu, KieuO.Chu),
            new(TenCot.TrichYeu, KieuO.Chu),
        ]),
    ]);

    public static readonly FileMau PhanCong = new(TenFilePhanCong,
    [
        new(TenSheet.PhanCong,
        [
            new(TenCot.LinhVuc, KieuO.Chu, true, DoDaiLinhVuc),
            new(TenCot.Quay, KieuO.SoDuong),
            new(TenCot.NoiTiepNhanChuyen, KieuO.Chu),
        ]),
        new(TenSheet.NhanSu,
        [
            new(TenCot.HoTen, KieuO.Chu, true),
            new(TenCot.XungHo, KieuO.Chu, false, 20),
            new(TenCot.ChucVu, KieuO.Chu),
            new(TenCot.Quay, KieuO.SoDuong),
            new(TenCot.MoTaCongViec, KieuO.Chu),
        ]),
    ]);

    public static readonly FileMau TrungTam = new(TenFileTrungTam,
    [
        new(TenSheet.TrungTam,
        [
            new(TenCot.Muc, KieuO.Chu, true),
            new(TenCot.GiaTri, KieuO.Chu),
        ]),
        new(TenSheet.GioLamViec,
        [
            new(TenCot.Thu, KieuO.Chu, true),
            new(TenCot.SangTu, KieuO.Gio),
            new(TenCot.SangDen, KieuO.Gio),
            new(TenCot.ChieuTu, KieuO.Gio),
            new(TenCot.ChieuDen, KieuO.Gio),
        ]),
        new(TenSheet.LienKet,
        [
            new(TenCot.Ten, KieuO.Chu, true),
            new(TenCot.DiaChiWeb, KieuO.Url, true, DoDaiUrl),
        ]),
        new(TenSheet.ODichVu,
        [
            new(TenCot.Ten, KieuO.Chu, true),
            new(TenCot.MoTa, KieuO.Chu),
            new(TenCot.BieuTuong, KieuO.LuaChon, false, 30, BieuTuong),
            new(TenCot.DiaChiWeb, KieuO.Url, false, DoDaiUrl),
        ]),
    ]);

    public static readonly FileMau TroLy = new(TenFileTroLy,
    [
        new(TenSheet.CauHoiMau,
        [
            new(TenCot.CauHoi, KieuO.Chu, true, DoDaiCauHoi),
            new(TenCot.CachHoiKhac, KieuO.DanhSach, false, DoDaiCauHoi),
            new(TenCot.CauTraLoi, KieuO.Chu),
            new(TenCot.MucThongTinTrungTam, KieuO.LuaChon, false, LuaChon: MucTrungTam),
            new(TenCot.MaThuTucLienQuan, KieuO.DanhSachMa, false, DoDaiMa),
        ]),
        new(TenSheet.ChuDeGoiY,
        [
            new(TenCot.TenHienThi, KieuO.Chu, true, 50),
            new(TenCot.LinhVuc, KieuO.Chu, true, DoDaiLinhVuc),
        ]),
        new(TenSheet.TuDongNghia,
        [
            new(TenCot.Tu, KieuO.Chu, true),
            new(TenCot.CachNoiKhac, KieuO.DanhSach, true),
        ]),
        new(TenSheet.VietTat,
        [
            new(TenCot.VietTat, KieuO.Chu, true),
            new(TenCot.DayDu, KieuO.Chu, true),
        ]),
    ]);

    /// <summary>4 file, theo thứ tự ghi của <c>nhap tat-ca</c>.</summary>
    public static readonly IReadOnlyList<FileMau> TatCa = [ThuTuc, PhanCong, TrungTam, TroLy];

    /// <summary>So khớp tên sheet, tên cột, giá trị lựa chọn: không phân biệt hoa thường, dấu, khoảng trắng thừa.</summary>
    public static bool SoKhop(string a, string b)
        => string.Equals(TiengViet.ChuanHoaTimKiem(a), TiengViet.ChuanHoaTimKiem(b), StringComparison.Ordinal);
}
