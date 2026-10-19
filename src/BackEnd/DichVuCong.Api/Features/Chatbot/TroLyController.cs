using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Common.RateLimiting;
using DichVuCong.Data.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;

namespace DichVuCong.Api.Features.Chatbot;

/// <summary>
/// Trợ lý trả lời (F06). Hai POST không cache và dùng chung bộ đếm <c>tro-ly</c> (60 câu/phút/IP, F06 BR-5, AC-28); câu hỏi nằm
/// trong body, không lên địa chỉ (có thể chứa CCCD, điện thoại, email). Body tối đa 64 KB đã áp toàn cục. Lỗi nhập trả 400
/// ProblemDetails có <c>code</c>, không nhắc lại nội dung câu.
/// </summary>
[ApiController]
[Route("api/tro-ly")]
public sealed class TroLyController(ITroLyService service) : ControllerBase
{
    [HttpPost("hoi")]
    [Consumes("application/json")]
    [EnableRateLimiting(RateLimitPolicies.TroLy)]
    public async Task<ActionResult<CauTraLoiDto>> Hoi(HoiRequest request, CancellationToken cancellationToken)
    {
        // Chỉ có khoảng trắng hoặc ký tự vô hình (U+200B–U+200F, U+FEFF) thì không phải câu hỏi.
        if (TiengViet.ChuanHoaTimKiem(request.CauHoi).Length == 0)
        {
            ModelState.AddModelError(nameof(HoiRequest.CauHoi), "Câu hỏi phải có ít nhất một ký tự nhìn thấy.");

            return ValidationProblem(ModelState);
        }

        return await service.HoiAsync(request.CauHoi, request.MaThuTuc, cancellationToken);
    }

    [HttpPost("chu-de")]
    [Consumes("application/json")]
    [EnableRateLimiting(RateLimitPolicies.TroLy)]
    public async Task<ActionResult<CauTraLoiDto>> HoiChuDe(HoiChuDeRequest request, CancellationToken cancellationToken)
    {
        var ketQua = await service.HoiChuDeAsync(request.ThuTu, request.MaThuTuc, cancellationToken);

        // Thân rỗng: UseStatusCodePages biến thành ProblemDetails có code = khong-tim-thay.
        return ketQua is null ? NotFound() : ketQua;
    }

    // HEAD cùng mã và header như GET; không nhận query nên không gắn DanhMucQuery.
    [HttpGet("chu-de")]
    [HttpHead("chu-de")]
    [OutputCache(PolicyName = CachePolicies.DanhMuc)]
    [EnableRateLimiting(RateLimitPolicies.DanhMuc)]
    public async Task<IReadOnlyList<ChuDeGoiYDto>> LayChuDe(CancellationToken cancellationToken)
        => await service.LayChuDeAsync(cancellationToken);
}
