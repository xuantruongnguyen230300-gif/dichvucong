using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Common.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;

namespace DichVuCong.Api.Features.DanhMuc;

[ApiController]
[Route("api/thu-tuc")]
public sealed class ThuTucDanhMucController(IDanhMucService service) : ControllerBase
{
    // Không nhận tham số, không gắn [DanhMucQuery]: query lạ bị bỏ khỏi khoá cache.
    // Rỗng là 200 với []; HEAD cùng mã và header như GET (Kestrel bỏ thân).
    [HttpGet]
    [HttpHead]
    [OutputCache(PolicyName = CachePolicies.DanhMuc)]
    [EnableRateLimiting(RateLimitPolicies.DanhMuc)]
    public async Task<IReadOnlyList<ThuTucRutGonDto>> Get(CancellationToken cancellationToken) =>
        await service.LayThuTucAsync(cancellationToken);
}
