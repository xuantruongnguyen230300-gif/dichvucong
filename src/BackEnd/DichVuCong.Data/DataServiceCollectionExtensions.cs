using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Data;

public static class DataServiceCollectionExtensions
{
    /// <summary>
    /// Nguồn PostgreSql: <see cref="AppDbContext"/> (pool) và <see cref="INguonDuLieu"/> scoped. Import gọi hàm này.
    /// Chuỗi kết nối được bổ sung timeout mặc định (xem <see cref="KetNoiDb"/>) nếu người dùng chưa khai.
    /// </summary>
    public static IServiceCollection AddDichVuCongData(this IServiceCollection services, string connectionString)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);

        services.AddDbContextPool<AppDbContext>(options => options
            .UseNpgsql(KetNoiDb.ApDungTimeoutMacDinh(connectionString))
            .UseSnakeCaseNamingConvention());
        services.AddScoped<INguonDuLieu, NguonDuLieuPostgreSql>();

        return services;
    }

    /// <summary>
    /// Nguồn Mẫu: nạp file nhúng ngay khi gọi (lỗi thì ném, khởi động dừng), không có <see cref="AppDbContext"/>.
    /// </summary>
    /// <exception cref="InvalidDataException">Chưa có tài nguyên nhúng hoặc file hỏng.</exception>
    public static IServiceCollection AddDichVuCongDataMau(this IServiceCollection services)
        => services.AddDichVuCongDataMau(TepDuLieuMau.Nhung);

    /// <summary>Nguồn Mẫu từ <paramref name="tep"/> cho sẵn (dùng trong test). Đăng ký <see cref="TepDuLieuMau"/> và <see cref="INguonDuLieu"/>, singleton.</summary>
    public static IServiceCollection AddDichVuCongDataMau(this IServiceCollection services, TepDuLieuMau tep)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(tep);

        tep.KiemTraVaNoi();
        services.AddSingleton(tep);
        services.AddSingleton<INguonDuLieu, NguonDuLieuMau>();

        return services;
    }
}
