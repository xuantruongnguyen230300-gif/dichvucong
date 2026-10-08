using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Data;

public static class DataServiceCollectionExtensions
{
    public static IServiceCollection AddDichVuCongData(this IServiceCollection services, string connectionString)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);

        services.AddDbContextPool<AppDbContext>(options => options.UseNpgsql(connectionString));

        return services;
    }
}
