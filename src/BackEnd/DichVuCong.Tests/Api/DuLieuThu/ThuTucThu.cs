using DichVuCong.Data.Entities;
using DichVuCong.Data.Mau;

namespace DichVuCong.Tests.Api.DuLieuThu;

/// <summary>
/// Bộ dữ liệu thử cho <c>ChiTietThuTucService</c>, dựng bằng C# (không cần DB hay file). Dùng chung cho lớp con nguồn Mẫu
/// và lớp con PostgreSQL của tester (F03 T10). Thứ tự bước, giấy tờ, căn cứ cố ý không theo thứ tự chữ cái để kiểm giữ nguyên thứ tự lưu.
/// </summary>
public static class ThuTucThu
{
    public static readonly DateTimeOffset ThoiDiem = new(2026, 10, 12, 20, 0, 0, TimeSpan.Zero);

    public const string MaDayDu = "T.001";

    /// <summary>Có thời hạn riêng "1 Khác"; cách thức đều không có thời hạn rõ.</summary>
    public const string MaThoiHanKhac = "T.002";

    /// <summary>Thời hạn "Khác"; cách thức thứ hai có thời hạn rõ.</summary>
    public const string MaThoiHanTuCachThuc = "T.003";

    /// <summary>Thời hạn "  3  KHÁC ", không có cách thức.</summary>
    public const string MaThoiHanKhacKhongCachThuc = "T.004";

    /// <summary>Chỉ có các trường bắt buộc.</summary>
    public const string MaToiThieu = "T.005";

    public const string TenLinhVuc = "Hộ tịch";

    /// <summary>Năm thủ tục, hai lĩnh vực. Thứ tự <c>ThuTu</c> cố ý đảo so với thứ tự thêm.</summary>
    public static TepDuLieuMau Bo()
    {
        var tep = new TepDuLieuMau { ThoiDiem = ThoiDiem, GhiChu = "Dữ liệu thử, không phải dữ liệu thật." };
        tep.LinhVuc.Add(new LinhVuc { Ma = "ho-tich", Ten = TenLinhVuc, TenTimKiem = "ho tich" });
        tep.LinhVuc.Add(new LinhVuc { Ma = "dat-dai", Ten = "Đất đai", TenTimKiem = "dat dai" });

        tep.ThuTuc.Add(new ThuTuc
        {
            Ma = MaToiThieu,
            Ten = "Thủ tục tối thiểu",
            TenTimKiem = "thu tuc toi thieu",
            LinhVucMa = "dat-dai",
            ThuocDanhMucXa = true,
            MucDo = MucDo.MotPhan,
            ThuTu = 5,
        });
        tep.ThuTuc.Add(new ThuTuc
        {
            Ma = MaDayDu,
            Ten = "Thủ tục đầy đủ",
            TenTimKiem = "thu tuc day du",
            LinhVucMa = "ho-tich",
            ThuocDanhMucXa = true,
            ThuocDanhMucTinh = true,
            MucDo = MucDo.ToanTrinh,
            CoQuanThucHien = "Ủy ban nhân dân cấp xã",
            YeuCauDieuKien = "Điều kiện thử.\nDòng hai.",
            ThoiHan = "5 ngày làm việc",
            Phi = "Lệ phí: 0 VNĐ",
            HinhThucNop = ["Trực tuyến", "Bưu chính", "Trực tiếp"],
            MaDvc = "H00.00",
            DonViMa = "H00.001",
            DonViTen = "Đơn vị thử",
            ThuTu = 1,
            ThuTuThuongGap = 3,
            TrinhTu =
            [
                new BuocTrinhTu { TruongHop = null, NoiDung = "Bước một.\nXuống dòng." },
                new BuocTrinhTu { TruongHop = "Trường hợp B", NoiDung = "Bước hai." },
                new BuocTrinhTu { TruongHop = "Trường hợp A", NoiDung = "Bước ba." },
            ],
            CachThuc =
            [
                new CachThucNop { HinhThuc = "Trực tuyến", ThoiHan = "3 ngày", Phi = "0 đồng", MoTa = "Qua Cổng DVC" },
                new CachThucNop { HinhThuc = "Trực tiếp", ThoiHan = "1 Khác", Phi = null, MoTa = null },
            ],
            ThanhPhanHoSo =
            [
                new GiayTo { Ten = "Giấy tờ Z", BanChinh = 1, BanSao = 0 },
                new GiayTo { Ten = "Giấy tờ M", BanChinh = 0, BanSao = 1 },
                new GiayTo { Ten = "Giấy tờ A", BanChinh = null, BanSao = null },
            ],
            KetQua = ["Kết quả Z", "Kết quả A"],
            CanCu =
            [
                new VanBanCanCu { SoKyHieu = "85/2019/TT-BTC", TrichYeu = "Thông tư thử" },
                new VanBanCanCu { SoKyHieu = "04/2020/NĐ-CP", TrichYeu = null },
                new VanBanCanCu { SoKyHieu = null, TrichYeu = "Chỉ có trích yếu" },
            ],
        });
        tep.ThuTuc.Add(new ThuTuc
        {
            Ma = MaThoiHanKhac,
            Ten = "Thủ tục thời hạn Khác",
            TenTimKiem = "thu tuc thoi han khac",
            LinhVucMa = "ho-tich",
            ThuocDanhMucTinh = true,
            MucDo = MucDo.MotPhan,
            ThoiHan = "1 Khác",
            CachThuc =
            [
                new CachThucNop { HinhThuc = "Trực tuyến", ThoiHan = "1 Khác" },
                new CachThucNop { HinhThuc = "Bưu chính", ThoiHan = "" },
            ],
            ThuTu = 2,
        });
        tep.ThuTuc.Add(new ThuTuc
        {
            Ma = MaThoiHanTuCachThuc,
            Ten = "Thủ tục thời hạn từ cách thức",
            TenTimKiem = "thu tuc thoi han tu cach thuc",
            LinhVucMa = "ho-tich",
            ThuocDanhMucXa = true,
            MucDo = MucDo.ToanTrinh,
            ThoiHan = "Khác",
            CachThuc =
            [
                new CachThucNop { HinhThuc = "Trực tuyến", ThoiHan = "Khác" },
                new CachThucNop { HinhThuc = "Trực tiếp", ThoiHan = "3 ngày làm việc" },
                new CachThucNop { HinhThuc = "Bưu chính", ThoiHan = "7 ngày" },
            ],
            ThuTu = 3,
        });
        tep.ThuTuc.Add(new ThuTuc
        {
            Ma = MaThoiHanKhacKhongCachThuc,
            Ten = "Thủ tục thời hạn Khác, không cách thức",
            TenTimKiem = "thu tuc thoi han khac, khong cach thuc",
            LinhVucMa = "ho-tich",
            ThuocDanhMucXa = true,
            MucDo = MucDo.ToanTrinh,
            ThoiHan = "  3  KHÁC ",
            ThuTu = 4,
        });

        return tep;
    }

    /// <summary>Chưa nhập thủ tục nào.</summary>
    public static TepDuLieuMau Rong() => new() { ThoiDiem = ThoiDiem };
}
