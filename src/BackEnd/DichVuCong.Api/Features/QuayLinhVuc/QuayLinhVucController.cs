using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Common.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;

namespace DichVuCong.Api.Features.QuayLinhVuc;

/// <summary>Không nhận tham số: query lạ bị bỏ qua và không vào khoá cache (không gắn <c>DanhMucQuery</c>).</summary>
[ApiController]
[Route("api/linh-vuc/quay")]
public sealed class QuayLinhVucController(IQuayLinhVucService service) : ControllerBase
{
    [HttpGet]
    [HttpHead]
    [OutputCache(PolicyName = CachePolicies.DanhMuc)]
    [EnableRateLimiting(RateLimitPolicies.DanhMuc)]
    public async Task<IReadOnlyList<QuayLinhVucDto>> Get(CancellationToken cancellationToken) =>
        await service.LayAsync(cancellationToken);
}
