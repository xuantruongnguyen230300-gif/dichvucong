using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Common.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;

namespace DichVuCong.Api.Features.ChiTietThuTuc;

[ApiController]
[Route("api/thu-tuc")]
public sealed class ChiTietThuTucController(IChiTietThuTucService service) : ControllerBase
{
    // Không gắn [DanhMucQuery]: query bị bỏ khỏi khoá cache, mỗi mã một mục cache theo đường dẫn.
    // HEAD cùng mã và header như GET (Kestrel bỏ thân).
    [HttpGet("{ma:maThuTuc}")]
    [HttpHead("{ma:maThuTuc}")]
    [OutputCache(PolicyName = CachePolicies.DanhMuc)]
    [EnableRateLimiting(RateLimitPolicies.DanhMuc)]
    public async Task<ActionResult<ChiTietThuTucDto>> Get(string ma, CancellationToken cancellationToken)
    {
        var ketQua = await service.LayAsync(ma, cancellationToken);

        // Thân rỗng: UseStatusCodePages biến thành ProblemDetails có code = khong-tim-thay, không nhắc lại mã.
        return ketQua is null ? NotFound() : ketQua;
    }
}
