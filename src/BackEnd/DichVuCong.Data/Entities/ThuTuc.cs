using System.Text.Json.Serialization;

namespace DichVuCong.Data.Entities;

public class ThuTuc
{
    public string Ma { get; set; } = string.Empty;

    public string Ten { get; set; } = string.Empty;

    public string TenTimKiem { get; set; } = string.Empty;

    public string LinhVucMa { get; set; } = string.Empty;

    /// <summary>Không có trong file dữ liệu mẫu; <c>TepDuLieuMau</c> nối lại sau khi đọc.</summary>
    [JsonIgnore]
    public LinhVuc? LinhVuc { get; set; }

    public bool ThuocDanhMucXa { get; set; }

    public bool ThuocDanhMucTinh { get; set; }

    public MucDo MucDo { get; set; }

    public string? CoQuanThucHien { get; set; }

    public string? YeuCauDieuKien { get; set; }

    public string? TrangThaiCongBo { get; set; }

    public string? ThoiHan { get; set; }

    public string? Phi { get; set; }

    public string[] HinhThucNop { get; set; } = [];

    public string? MaDvc { get; set; }

    public string? DonViTen { get; set; }

    public string? DonViMa { get; set; }

    /// <summary>Thứ tự dòng trong sheet Thủ tục.</summary>
    public int ThuTu { get; set; }

    /// <summary>Null là không thuộc nhóm thường gặp; có giá trị thì F03 xếp theo cột này.</summary>
    public int? ThuTuThuongGap { get; set; }

    public List<BuocTrinhTu> TrinhTu { get; set; } = [];

    public List<CachThucNop> CachThuc { get; set; } = [];

    public List<GiayTo> ThanhPhanHoSo { get; set; } = [];

    public string[] KetQua { get; set; } = [];

    public List<VanBanCanCu> CanCu { get; set; } = [];
}
