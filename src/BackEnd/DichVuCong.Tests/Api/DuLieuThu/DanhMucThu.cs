using DichVuCong.Data.Entities;
using DichVuCong.Data.Mau;

namespace DichVuCong.Tests.Api.DuLieuThu;

/// <summary>
/// Bộ dữ liệu thử cho <c>DanhMucService</c>, dựng bằng C# (không cần DB hay file). Dùng chung cho lớp con nguồn Mẫu
/// và lớp con PostgreSQL của tester (F04 T14). Thứ tự thêm cố ý đảo so với <c>ThuTu</c> và thứ tự chữ cái.
/// Mọi thủ tục thuộc ít nhất một cấp (DB có ràng buộc <c>ck_thu_tuc_danh_muc</c>).
/// </summary>
public static class DanhMucThu
{
    public static readonly DateTimeOffset ThoiDiem = new(2026, 10, 12, 20, 0, 0, TimeSpan.Zero);

    public static TepDuLieuMau Bo()
    {
        var tep = new TepDuLieuMau { ThoiDiem = ThoiDiem, GhiChu = "Dữ liệu thử, không phải dữ liệu thật." };

        // Thứ tự đúng theo TenTimKiem Ordinal rồi Ma: chung-thuc, dat-dai, dau-tu, ho-tich, thuy-loi, thuy-loi-2, thuy-san.
        // "trong" không có thủ tục nào: không được trả ra.
        tep.LinhVuc.Add(new LinhVuc { Ma = "ho-tich", Ten = "Hộ tịch", TenTimKiem = "ho tich" });
        tep.LinhVuc.Add(new LinhVuc { Ma = "thuy-san", Ten = "Thuỷ sản", TenTimKiem = "thuy san" });
        tep.LinhVuc.Add(new LinhVuc { Ma = "dau-tu", Ten = "Đầu tư", TenTimKiem = "dau tu" });
        tep.LinhVuc.Add(new LinhVuc { Ma = "thuy-loi-2", Ten = "Thuỷ lợi", TenTimKiem = "thuy loi" });
        tep.LinhVuc.Add(new LinhVuc { Ma = "trong", Ten = "Lĩnh vực trống", TenTimKiem = "linh vuc trong" });
        tep.LinhVuc.Add(new LinhVuc { Ma = "dat-dai", Ten = "Đất đai", TenTimKiem = "dat dai" });
        tep.LinhVuc.Add(new LinhVuc { Ma = "thuy-loi", Ten = "Thủy lợi", TenTimKiem = "thuy loi" });
        tep.LinhVuc.Add(new LinhVuc { Ma = "chung-thuc", Ten = "Chứng thực", TenTimKiem = "chung thuc" });

        // Thêm theo thứ tự đảo: ThuTu 8 trước, 1 sau.
        tep.ThuTuc.Add(ThuTuc("D.08", 8, "thuy-loi", xa: false, tinh: true, MucDo.MotPhan, thoiHan: "7 ngày"));
        tep.ThuTuc.Add(ThuTuc("D.07", 7, "thuy-loi-2", xa: true, tinh: false, MucDo.MotPhan, thoiHan: null));
        tep.ThuTuc.Add(ThuTuc("D.06", 6, "dau-tu", xa: false, tinh: true, MucDo.ToanTrinh, thoiHan: "Khác"));
        tep.ThuTuc.Add(ThuTuc("D.05", 5, "thuy-san", xa: true, tinh: true, MucDo.ToanTrinh, thoiHan: "  3  KHÁC "));
        tep.ThuTuc.Add(ThuTuc("D.04", 4, "dat-dai", xa: false, tinh: true, MucDo.MotPhan, thoiHan: "1 Khác", thuongGap: 2,
            cachThuc: [new CachThucNop { HinhThuc = "Trực tiếp", ThoiHan = "" }, new CachThucNop { HinhThuc = "Trực tuyến", ThoiHan = "10 ngày làm việc" }]));
        tep.ThuTuc.Add(ThuTuc("D.03", 3, "chung-thuc", xa: true, tinh: false, MucDo.ToanTrinh, thoiHan: "30 ngày", thuongGap: 1,
            cachThuc: [new CachThucNop { HinhThuc = "Trực tuyến", ThoiHan = "5 ngày" }]));
        tep.ThuTuc.Add(ThuTuc("D.02", 2, "ho-tich", xa: true, tinh: true, MucDo.ToanTrinh, thoiHan: "Khác",
            cachThuc: [new CachThucNop { HinhThuc = "Trực tuyến", ThoiHan = "Khác" }, new CachThucNop { HinhThuc = "Bưu chính", ThoiHan = "2 ngày" }, new CachThucNop { HinhThuc = "Trực tiếp", ThoiHan = "4 ngày" }]));
        tep.ThuTuc.Add(ThuTuc("D.01", 1, "ho-tich", xa: true, tinh: false, MucDo.ToanTrinh, thoiHan: "5 ngày làm việc",
            coQuan: "Ủy ban nhân dân cấp xã", cachThuc: [new CachThucNop { HinhThuc = "Trực tuyến", ThoiHan = "1 ngày" }]));

        return tep;
    }

    /// <summary>Chưa nhập thủ tục và lĩnh vực nào.</summary>
    public static TepDuLieuMau Rong() => new() { ThoiDiem = ThoiDiem };

    /// <summary>Có lĩnh vực nhưng chưa có thủ tục nào.</summary>
    public static TepDuLieuMau ChiCoLinhVuc()
    {
        var tep = Rong();
        tep.LinhVuc.Add(new LinhVuc { Ma = "ho-tich", Ten = "Hộ tịch", TenTimKiem = "ho tich" });

        return tep;
    }

    private static ThuTuc ThuTuc(
        string ma,
        int thuTu,
        string linhVucMa,
        bool xa,
        bool tinh,
        MucDo mucDo,
        string? thoiHan,
        int? thuongGap = null,
        string? coQuan = null,
        List<CachThucNop>? cachThuc = null) => new()
    {
        Ma = ma,
        Ten = $"Thủ tục {ma}",
        TenTimKiem = $"thu tuc {ma.ToLowerInvariant()}",
        LinhVucMa = linhVucMa,
        ThuocDanhMucXa = xa,
        ThuocDanhMucTinh = tinh,
        MucDo = mucDo,
        ThoiHan = thoiHan,
        CoQuanThucHien = coQuan,
        ThuTu = thuTu,
        ThuTuThuongGap = thuongGap,
        CachThuc = cachThuc ?? [],
        // Các trường chi tiết có nội dung: danh mục rút gọn không được trả ra.
        Phi = "Lệ phí thử",
        YeuCauDieuKien = "Điều kiện thử",
        MaDvc = "H00.00",
        DonViMa = "H00.001",
        DonViTen = "Đơn vị thử",
        TrinhTu = [new BuocTrinhTu { NoiDung = "Bước thử" }],
        KetQua = ["Kết quả thử"],
    };
}
