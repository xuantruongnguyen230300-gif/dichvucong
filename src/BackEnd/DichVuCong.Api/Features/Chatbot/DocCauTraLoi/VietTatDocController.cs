using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Common.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;

namespace DichVuCong.Api.Features.Chatbot.DocCauTraLoi;

/// <summary>
/// Bảng viết tắt cho phần đọc câu trả lời (F07 BR-3). Dữ liệu công khai, nhỏ; cache <c>danh-muc</c> (ETag theo lần nhập, 304).
/// Không nhận query nên không gắn <c>DanhMucQuery</c>.
/// </summary>
[ApiController]
[Route("api/tro-ly/viet-tat")]
public sealed class VietTatDocController(IVietTatDocService service) : ControllerBase
{
    // HEAD cùng mã và header như GET (Kestrel bỏ thân); cache policy và middleware 304 đã xử lý cả HEAD.
    [HttpGet]
    [HttpHead]
    [OutputCache(PolicyName = CachePolicies.DanhMuc)]
    [EnableRateLimiting(RateLimitPolicies.DanhMuc)]
    public async Task<IReadOnlyList<VietTatDocDto>> Get(CancellationToken cancellationToken)
        => await service.LayAsync(cancellationToken);
}
