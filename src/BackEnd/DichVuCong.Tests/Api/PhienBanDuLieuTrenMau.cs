using DichVuCong.Data;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Api;

/// <summary>Chạy test hợp đồng của phiên bản dữ liệu trên nguồn Mẫu (không cần DB).</summary>
public sealed class PhienBanDuLieuTrenMau : PhienBanDuLieuContract
{
    protected override INguonDuLieu TaoNguon(TepDuLieuMau tep)
    {
        var services = new ServiceCollection();
        services.AddDichVuCongDataMau(tep);

        // Nguồn Mẫu là singleton trong bộ nhớ, không giữ tài nguyên cần giải phóng.
#pragma warning disable CA2000
        return services.BuildServiceProvider().GetRequiredService<INguonDuLieu>();
#pragma warning restore CA2000
    }
}
