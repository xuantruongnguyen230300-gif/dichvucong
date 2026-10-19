using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Common.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;

namespace DichVuCong.Api.Features.ThongTinTrungTam;

[ApiController]
[Route("api/trung-tam")]
public sealed class ThongTinTrungTamController(IThongTinTrungTamService service) : ControllerBase
{
    // HEAD cùng mã và header như GET (Kestrel bỏ thân); cache policy và middleware 304 đã xử lý cả HEAD.
    [HttpGet]
    [HttpHead]
    [OutputCache(PolicyName = CachePolicies.DanhMuc)]
    [EnableRateLimiting(RateLimitPolicies.DanhMuc)]
    public async Task<ActionResult<ThongTinTrungTamDto>> Get(CancellationToken cancellationToken)
    {
        var ketQua = await service.LayAsync(cancellationToken);

        // Thân rỗng: UseStatusCodePages biến thành ProblemDetails có code = khong-tim-thay.
        return ketQua is null ? NotFound() : ketQua;
    }
}
