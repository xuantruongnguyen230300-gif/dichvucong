namespace DichVuCong.Data.DuLieu;

/// <summary>Nguồn dữ liệu của API (khoá cấu hình <c>DuLieu:Nguon</c>, plan F00 §9.2).</summary>
public enum LoaiNguonDuLieu
{
    /// <summary>File dữ liệu mẫu nạp vào bộ nhớ, không cần PostgreSQL.</summary>
    Mau,

    /// <summary>PostgreSQL qua EF Core.</summary>
    PostgreSql,
}
