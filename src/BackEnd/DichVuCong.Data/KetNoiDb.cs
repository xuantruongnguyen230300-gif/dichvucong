using Npgsql;

namespace DichVuCong.Data;

/// <summary>Chuẩn hoá chuỗi kết nối PostgreSql: DB không tới được thì báo lỗi nhanh, không giữ luồng.</summary>
internal static class KetNoiDb
{
    public const string TenKhoaCauHinh = "ConnectionStrings:DichVuCong";

    /// <summary>Chờ mở kết nối tối đa (giây).</summary>
    public const int ThoiGianKetNoiGiay = 5;

    /// <summary>Chờ một lệnh tối đa (giây).</summary>
    public const int ThoiGianLenhGiay = 10;

    /// <summary>
    /// Thêm <c>Timeout</c> và <c>Command Timeout</c> mặc định; giá trị người dùng đã khai (kể cả tên đồng nghĩa) được giữ nguyên.
    /// Không ghi chuỗi kết nối ra log hay thông báo lỗi.
    /// </summary>
    /// <exception cref="ArgumentException">
    /// Chuỗi sai cú pháp. Thông báo chỉ nêu tên khoá cấu hình, không chép nội dung chuỗi (exception gốc của Npgsql
    /// có thể chứa mảnh chuỗi như mật khẩu hay host nên không giữ làm exception bên trong).
    /// </exception>
    public static string ApDungTimeoutMacDinh(string chuoiKetNoi)
    {
        NpgsqlConnectionStringBuilder builder;
        try
        {
            builder = new NpgsqlConnectionStringBuilder(chuoiKetNoi);
        }
        catch (Exception e) when (e is not OperationCanceledException)
        {
            throw new ArgumentException($"Chuỗi kết nối {TenKhoaCauHinh} không hợp lệ.", nameof(chuoiKetNoi));
        }

        if (!builder.ShouldSerialize(nameof(NpgsqlConnectionStringBuilder.Timeout)))
        {
            builder.Timeout = ThoiGianKetNoiGiay;
        }

        if (!builder.ShouldSerialize("Command Timeout"))
        {
            builder.CommandTimeout = ThoiGianLenhGiay;
        }

        return builder.ConnectionString;
    }
}
