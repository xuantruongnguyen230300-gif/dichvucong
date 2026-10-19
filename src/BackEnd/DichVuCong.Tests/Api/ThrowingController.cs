using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DichVuCong.Tests.Api;

/// <summary>Chỉ được thêm vào ứng dụng trong test (qua ApiFactory) để gây lỗi không bắt được.</summary>
[ApiController]
[Route("api/test-loi")]
public sealed class ThrowingController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() =>
        throw new InvalidOperationException("BI-MAT-KET-NOI Host=secret");

    [HttpGet("khong-hop-le")]
    public IActionResult KhongHopLe() => BadRequest();

    [HttpPost("kiem-tra")]
    public IActionResult KiemTra(YeuCauMau yeuCau) => Ok(yeuCau);

    [HttpPost("qua-lon")]
    public IActionResult QuaLon() =>
        throw new BadHttpRequestException("body qua lon", StatusCodes.Status413PayloadTooLarge);
}

public sealed record YeuCauMau([Required] string? Ten);
