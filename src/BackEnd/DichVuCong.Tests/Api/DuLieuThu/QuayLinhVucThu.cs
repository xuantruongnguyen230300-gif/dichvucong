using DichVuCong.Data.Entities;
using DichVuCong.Data.Mau;

namespace DichVuCong.Tests.Api.DuLieuThu;

/// <summary>
/// Bộ dữ liệu thử cho <c>QuayLinhVucService</c>, dựng bằng C# (không cần DB hay file). Dùng chung cho lớp con nguồn Mẫu
/// và lớp con PostgreSQL. Thứ tự thêm cố ý lẫn lộn để kiểm sắp theo mã Ordinal. Phân công không cần có lĩnh vực tương ứng (không khoá ngoại).
/// </summary>
public static class QuayLinhVucThu
{
    public static readonly DateTimeOffset ThoiDiem = new(2026, 10, 13, 1, 0, 0, TimeSpan.Zero);

    /// <summary>Có quầy, quầy trống (chỉ nơi tiếp nhận chuyển), mã không có trong lĩnh vực.</summary>
    public static TepDuLieuMau Bo()
    {
        var tep = Rong();
        tep.LinhVuc.Add(new LinhVuc { Ma = "ho-tich", Ten = "Hộ tịch", TenTimKiem = "ho tich" });
        tep.LinhVuc.Add(new LinhVuc { Ma = "dat-dai", Ten = "Đất đai", TenTimKiem = "dat dai" });

        // Thêm lẫn lộn; đúng thứ tự Ordinal: dat-dai, dat-dai-2, ho-tich, khong-co-trong-linh-vuc, thuy-loi.
        tep.PhanCongLinhVuc.Add(PhanCong("thuy-loi", 12));
        tep.PhanCongLinhVuc.Add(PhanCong("ho-tich", 3));
        tep.PhanCongLinhVuc.Add(PhanCong("dat-dai-2", 7));
        tep.PhanCongLinhVuc.Add(PhanCong("dat-dai", 5));
        tep.PhanCongLinhVuc.Add(PhanCong("khong-co-trong-linh-vuc", 9));

        // Quầy trống: bị loại dù có nơi tiếp nhận chuyển.
        tep.PhanCongLinhVuc.Add(new PhanCongLinhVuc
        {
            LinhVucMa = "chung-thuc",
            TenLinhVuc = "Chứng thực",
            Quay = null,
            NoiTiepNhanChuyen = "Phòng Tư pháp",
        });

        return tep;
    }

    /// <summary>Chưa nhập phân công nào.</summary>
    public static TepDuLieuMau Rong() => new() { ThoiDiem = ThoiDiem, GhiChu = "Dữ liệu thử, không phải dữ liệu thật." };

    /// <summary>Có dòng phân công nhưng không dòng nào có quầy.</summary>
    public static TepDuLieuMau ChiQuayTrong()
    {
        var tep = Rong();
        tep.PhanCongLinhVuc.Add(new PhanCongLinhVuc { LinhVucMa = "ho-tich", TenLinhVuc = "Hộ tịch", Quay = null, NoiTiepNhanChuyen = "Sở Tư pháp" });

        return tep;
    }

    private static PhanCongLinhVuc PhanCong(string ma, int quay) => new()
    {
        LinhVucMa = ma,
        TenLinhVuc = $"Lĩnh vực {ma}",
        Quay = quay,
        // Không được trả ra.
        NoiTiepNhanChuyen = "Nơi thử",
    };
}
