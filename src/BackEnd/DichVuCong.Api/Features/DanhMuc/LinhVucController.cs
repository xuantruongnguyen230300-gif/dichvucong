using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Common.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;

namespace DichVuCong.Api.Features.DanhMuc;

[ApiController]
[Route("api/linh-vuc")]
public sealed class LinhVucController(IDanhMucService service) : ControllerBase
{
    [HttpGet]
    [HttpHead]
    [OutputCache(PolicyName = CachePolicies.DanhMuc)]
    [EnableRateLimiting(RateLimitPolicies.DanhMuc)]
    public async Task<IReadOnlyList<LinhVucDto>> Get(CancellationToken cancellationToken) =>
        await service.LayLinhVucAsync(cancellationToken);
}
