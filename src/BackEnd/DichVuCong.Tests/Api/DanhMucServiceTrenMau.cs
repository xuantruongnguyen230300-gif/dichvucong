using DichVuCong.Api.Features.DanhMuc;
using DichVuCong.Data;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Entities;
using DichVuCong.Data.Mau;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Api;

/// <summary>Chạy test hợp đồng của <c>DanhMucService</c> trên nguồn Mẫu (không cần DB).</summary>
public sealed class DanhMucServiceTrenMau : DanhMucServiceContract
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

    [Fact]
    public async Task ThuTucKhongThuocCapNao_KhongTraRa_VaKhongTinhVaoLinhVuc()
    {
        // Chỉ dựng được ở nguồn Mẫu: DB có ràng buộc ck_thu_tuc_danh_muc nên không chứa dòng như vậy.
        var tep = new TepDuLieuMau { ThoiDiem = DateTimeOffset.UnixEpoch };
        tep.LinhVuc.Add(new LinhVuc { Ma = "a", Ten = "A", TenTimKiem = "a" });
        tep.ThuTuc.Add(new ThuTuc { Ma = "X.1", Ten = "X", TenTimKiem = "x", LinhVucMa = "a", ThuTu = 1 });
        var service = new DanhMucService(TaoNguon(tep));

        Assert.Empty(await service.LayThuTucAsync(TestContext.Current.CancellationToken));
        Assert.Empty(await service.LayLinhVucAsync(TestContext.Current.CancellationToken));
    }
}
