using DichVuCong.Data.Entities;
using DichVuCong.Data.Mau;
using TrungTamEntity = DichVuCong.Data.Entities.TrungTam;

namespace DichVuCong.Tests.Api.DuLieuThu;

/// <summary>
/// Bộ dữ liệu thử cho <c>ThongTinTrungTamService</c>, dựng bằng C# (không cần DB hay file). Dùng chung cho lớp con nguồn Mẫu
/// và lớp con PostgreSQL của tester (F00 T31, ghi <see cref="TepDuLieuMau"/> vào DB rồi chạy cùng các ca).
/// Liên kết, ô dịch vụ, giờ làm việc cố ý thêm lệch thứ tự để kiểm sắp theo khoá số.
/// </summary>
public static class TrungTamThu
{
    // 20:00 UTC ngày 12 = 03:00 ngày 13 giờ Việt Nam: kiểm đổi múi giờ.
    public static readonly DateTimeOffset ThoiDiem = new(2026, 10, 12, 20, 0, 0, TimeSpan.Zero);

    public static readonly DateOnly NgayCapNhat = new(2026, 10, 13);

    /// <summary>Có đủ Trung tâm, giờ làm việc, liên kết, ô dịch vụ.</summary>
    public static TepDuLieuMau DayDu()
    {
        var tep = new TepDuLieuMau { ThoiDiem = ThoiDiem, GhiChu = "Dữ liệu thử, không phải dữ liệu thật." };
        tep.TrungTam = new TrungTamEntity
        {
            Ten = "Trung tâm thử A",
            Xa = "xã thử B",
            Tinh = "tỉnh thử C",
            CoQuanChuQuan = "UBND xã thử B",
            NguoiChiuTrachNhiem = "Người thử",
            ChucVuNguoiChiuTrachNhiem = "Giám đốc (dữ liệu thử)",
            DiaChi = "Địa chỉ thử",
            DienThoai = "0000.000.000",
            Email = "thu@example.gov.vn",
            BanDo = "https://example.gov.vn/ban-do",
            ZaloOa = null,
            Facebook = "https://facebook.com/thu",
            YouTube = null,
            TikTok = "https://tiktok.com/@thu",
            GhiChuNgayNghi = "Nghỉ thứ Bảy, Chủ nhật và ngày lễ.",
        };
        tep.GioLamViec.Add(new GioLamViec { Thu = 6, SangTu = new TimeOnly(7, 0), SangDen = new TimeOnly(11, 0) });
        tep.GioLamViec.Add(new GioLamViec { Thu = 1, SangTu = new TimeOnly(7, 0), SangDen = new TimeOnly(11, 30), ChieuTu = new TimeOnly(13, 30), ChieuDen = new TimeOnly(17, 5) });
        tep.GioLamViec.Add(new GioLamViec { Thu = 3, SangTu = null, SangDen = null, ChieuTu = new TimeOnly(13, 0), ChieuDen = new TimeOnly(16, 0) });
        tep.LienKet.Add(new LienKet { ThuTu = 2, Ten = "Liên kết thứ hai", Url = "https://example.gov.vn/hai" });
        tep.LienKet.Add(new LienKet { ThuTu = 1, Ten = "Cổng Dịch vụ công Quốc gia", Url = "https://dichvucong.gov.vn" });
        tep.ODichVu.Add(new ODichVu { ThuTu = 2, Ten = "Tra cứu hồ sơ", MoTa = "Xem hồ sơ", BieuTuong = "tra-cuu-ho-so", Url = "https://example.gov.vn/tra-cuu" });
        tep.ODichVu.Add(new ODichVu { ThuTu = 1, Ten = "Đánh giá hài lòng", MoTa = null, BieuTuong = "danh-gia", Url = null });

        return tep;
    }

    /// <summary>Chưa nhập dữ liệu Trung tâm: không có dòng <c>trung_tam</c>.</summary>
    public static TepDuLieuMau ChuaCoTrungTam() => new() { ThoiDiem = ThoiDiem };

    /// <summary>Có dòng Trung tâm tối thiểu, các cột không bắt buộc để null, không có giờ, liên kết, ô dịch vụ.</summary>
    public static TepDuLieuMau ToiThieu() => new()
    {
        ThoiDiem = ThoiDiem,
        TrungTam = new TrungTamEntity
        {
            Ten = "Trung tâm thử tối thiểu",
            NguoiChiuTrachNhiem = "Người thử",
            DiaChi = "Địa chỉ thử",
            DienThoai = "0000.000.000",
            Email = "thu@example.gov.vn",
        },
    };
}
